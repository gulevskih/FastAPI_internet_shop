from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.products import Product as ProductModel
from app.models.categories import Category as CategoryModel
from app.schemas import Product as ProductSchema, ProductCreate
from app.db_depends import get_db, get_async_db


# Создаём маршрутизатор для товаров
router = APIRouter(
    prefix="/products",
    tags=["products"],
)


@router.get("/", response_model=list[ProductSchema])
async def get_all_products(db: AsyncSession = Depends(get_async_db)):
    """
    Возвращает список всех активных товаров.
    """
    stmt = select(ProductModel).where(ProductModel.is_active == True)
    result = await db.scalars(stmt)
    products = result.all()
    return products


@router.post("/", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_async_db)):
    """
    Создаёт новый товар.
    """
    # Проверка существования активной категории
    stmt = select(CategoryModel).where(CategoryModel.id == product.category_id,
                                        CategoryModel.is_active == True)
    category_result = await db.scalars(stmt)
    category = category_result.first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found or inactive")

    # Создание нового товара
    db_product = ProductModel(**product.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.get("/category/{category_id}", response_model=list[ProductSchema], status_code=status.HTTP_200_OK)
async def get_products_by_category(category_id: int, db: AsyncSession = Depends(get_async_db)):
    """
    Возвращает список товаров в указанной категории по её ID.
    """
    # Проверка существования активной категории
    stmt = select(CategoryModel).where(CategoryModel.id == category_id,
                                       CategoryModel.is_active == True)
    category_result = await db.scalars(stmt)
    category = category_result.first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Category not found or inactive")
    
    # Получение списка товаров в указанной катероии
    stmt = select(ProductModel).where(ProductModel.category_id == category_id,
                                      ProductModel.is_active == True)
    product_result = await db.scalars(stmt)
    products = product_result.all()
    return products


@router.get("/{product_id}", response_model=ProductSchema, status_code=status.HTTP_200_OK)
async def get_product(product_id: int, db: AsyncSession=Depends(get_async_db)):
    """
    Возвращает детальную информацию о товаре по его ID.
    """
    # Проверка существования активного товара
    stmt = select(ProductModel).where(ProductModel.id == product_id,
                                      ProductModel.is_active == True)
    product_result = await db.scalars(stmt)
    product = product_result.first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Product not found or inactive")
    
    # Проверка существования активной категории
    stmt = select(CategoryModel).where(CategoryModel.id == product.category_id,
                                       CategoryModel.is_active == True)
    category_result = await db.scalars(stmt)
    category = category_result.first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Category not found or inactive")
    
    return product


@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(product_id: int, product: ProductCreate, db: AsyncSession  = Depends(get_async_db)):
    """
    Обновляет товар по его ID.
    """
    # Проверяем, существует ли товар
    product_result = await db.scalars(
        select(ProductModel).where(ProductModel.id == product_id, ProductModel.is_active == True)
    )
    db_product = product_result.first()
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or inactive")

    # Проверяем, существует ли активная категория
    category_result = await db.scalars(
        select(CategoryModel).where(CategoryModel.id == product.category_id,
                                    CategoryModel.is_active == True)
    )
    category = category_result.first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Category not found or inactive")

    # Обновляем товар
    await db.execute(
        update(ProductModel).where(ProductModel.id == product_id).values(**product.model_dump())
    )
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Удаляет товар по его ID (логическое удаление).
    """
    # Проверяем, существует ли активный товар
    product = db.scalars(
        select(ProductModel).where(ProductModel.id == product_id, ProductModel.is_active == True)
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Product not found or inactive")

    # Изменяем объект устанавив is_active=False и сохраняем
    product.is_active = False
    db.commit()

    return {"status": "success", "message": "Product marked as inactive"}

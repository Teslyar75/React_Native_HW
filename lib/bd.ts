import * as SQLite from "expo-sqlite";
import * as Crypto from 'expo-crypto';

export interface Product{
    id?:string;
    title: string;
    description: string
    price: number
    created_at: number
    deleted_at?: number
}

class DatabaseManager{
    private db: SQLite.SQLiteDatabase|null = null;

    async init(){
        this.db = await SQLite.openDatabaseAsync("shop.db");

        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS products(
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                created_at INTEGER NOT NULL,
                deleted_at INTEGER DEFAULT NULL
            );
            `)
    }
    async addProduct(product:Product){
        if(!this.db) throw new Error("DB is not initialized");
        const result = await this.db.runAsync(
            `INSERT INTO products (id, title, price, description, created_at) VALUES(?, ?, ?, ?, ?)`,[
                Crypto.randomUUID(), product.title, product.price, product.description, Date.now()
            ]
        );

        return result.lastInsertRowId;
    }
    async getAllProducts(): Promise<Product[]>{
        if(!this.db) throw new Error("DB is not initialized");
        return this.db.getAllAsync<Product>(
            'SELECT * FROM products WHERE deleted_at IS NULL ORDER BY title',
        );
    }
    async getProductById(id: string): Promise<Product | null>{
        if(!this.db) throw new Error("DB is not initialized");
        return this.db.getFirstAsync<Product>(
            'SELECT * FROM products WHERE id = ? AND deleted_at IS NULL',
            [id],
        );
    }
    async updateProduct(id: string, product: Pick<Product, 'title' | 'description' | 'price'>){
        if(!this.db) throw new Error("DB is not initialized");
        await this.db.runAsync(
            'UPDATE products SET title = ?, description = ?, price = ? WHERE id = ?',
            [product.title, product.description, product.price, id],
        );
    }
    async deleteProduct(id: string){
        if(!this.db) throw new Error("DB is not initialized");
        await this.db.runAsync('UPDATE products SET deleted_at = ? WHERE id = ?', [
            Date.now(), id
        ]);
    }
}

export const dbManager = new DatabaseManager();
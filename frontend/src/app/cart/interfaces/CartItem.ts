import { Product } from "../../products/interfaces/Product";

export interface CartItem {
    product: Product;
    quantity: number;
} 
import { Product } from '../models/Product';

/**
 * Reserve inventory – atomic updates without transactions
 */
export const reserveInventory = async (
  items: Array<{ productId: string; quantity: number }>
): Promise<{
  success: boolean;
  reserved: Array<{ productId: string; quantity: number; price: number }>;
  failed: Array<{ productId: string; reason: string }>;
}> => {
  const reserved: Array<{ productId: string; quantity: number; price: number }> = [];
  const failed: Array<{ productId: string; reason: string }> = [];

  for (const item of items) {
    try {
      const product = await Product.findById(item.productId);
      if (!product) {
        failed.push({ productId: item.productId, reason: 'Product not found' });
        continue;
      }

      if (product.stock < item.quantity) {
        failed.push({
          productId: item.productId,
          reason: `Insufficient stock. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
        continue;
      }

      // Atomically decrement stock
      const updated = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        failed.push({ productId: item.productId, reason: 'Failed to update stock' });
        continue;
      }

      reserved.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    } catch (error) {
      failed.push({
        productId: item.productId,
        reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return {
    success: failed.length === 0,
    reserved,
    failed,
  };
};

/**
 * Release inventory (for order cancellation)
 */
export const releaseInventory = async (
  items: Array<{ productId: string; quantity: number }>
): Promise<void> => {
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity } }
    );
  }
};

/**
 * Get inventory levels for multiple products
 */
export const getInventoryLevels = async (productIds: string[]): Promise<Map<string, number>> => {
  const products = await Product.find(
    { _id: { $in: productIds } },
    { _id: 1, stock: 1 }
  );
  const inventoryMap = new Map<string, number>();
  products.forEach(product => {
    inventoryMap.set(product._id.toString(), product.stock);
  });
  return inventoryMap;
};

/**
 * Check if a product is available in requested quantity
 */
export const checkAvailability = async (
  productId: string,
  quantity: number
): Promise<{ available: boolean; stock: number }> => {
  const product = await Product.findById(productId, { stock: 1 });
  if (!product) {
    return { available: false, stock: 0 };
  }
  return {
    available: product.stock >= quantity,
    stock: product.stock,
  };
};

/**
 * Bulk update stock levels (for admin)
 */
export const bulkUpdateStock = async (
  updates: Array<{ productId: string; stock: number }>
): Promise<void> => {
  for (const update of updates) {
    await Product.findByIdAndUpdate(
      update.productId,
      { stock: update.stock }
    );
  }
};
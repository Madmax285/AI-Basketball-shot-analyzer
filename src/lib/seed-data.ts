
import { 
  collection, 
  doc, 
  writeBatch, 
  getDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { subDays, addDays, formatISO } from 'date-fns';

const COLLECTIONS = {
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  SALES_ORDERS: 'salesOrders',
  ORDER_ITEMS: 'orderItems',
  DELIVERIES: 'deliveries',
  SHIPMENTS: 'shipments',
  METADATA: 'system'
};

const CUSTOMER_NAMES = [
  "Apex Manufacturing Pvt Ltd", "BlueWave Technologies Pvt Ltd", "Vertex Industrial Solutions",
  "Nova Retail Systems", "Prime Components India", "GreenField Engineering", "Orion Electronics",
  "Sunrise Logistics", "Metro Machinery", "GlobalTech Solutions", "Zenith Power Systems",
  "Quantum Hardware", "Infinity Softwares", "Pinnacle Logistics", "Reliance Industrial",
  "Tata Enterprise", "Mahindra & Mahindra", "Adani Group", "Larsen & Toubro", "Infosys Technologies",
  "Wipro Limited", "HCL Technologies", "Tech Mahindra", "Bajaj Auto", "Hero MotoCorp"
];

const CATEGORIES = ["Electronics", "Industrial Equipment", "Office Equipment", "Computer Hardware", "Networking", "Software", "Packaging", "Safety Equipment"];

export async function initializeDemoDataset(db: Firestore, userId: string) {
  const metaRef = doc(db, COLLECTIONS.METADATA, 'demoDataset');
  const metaSnap = await getDoc(metaRef);

  if (metaSnap.exists() && metaSnap.data().initialized) {
    throw new Error("Demo dataset is already initialized.");
  }

  const batch = writeBatch(db);

  // 1. Seed 25 Customers
  const customers = [];
  for (let i = 1; i <= 25; i++) {
    const id = `CUST10${i.toString().padStart(2, '0')}`;
    const customer = {
      id,
      name: CUSTOMER_NAMES[i - 1],
      email: `contact@${CUSTOMER_NAMES[i - 1].toLowerCase().replace(/\s/g, '')}.com`,
      phone: `+91 98765 ${i.toString().padStart(5, '0')}`,
      address: `${i * 10} Industrial Area, Phase ${i % 5 + 1}`,
      city: i % 2 === 0 ? "Mumbai" : "Bangalore",
      status: "Active",
      createdAt: serverTimestamp(),
      createdBy: userId
    };
    batch.set(doc(db, COLLECTIONS.CUSTOMERS, id), customer);
    customers.push(customer);
  }

  // 2. Seed 40 Products
  const products = [];
  for (let i = 1; i <= 40; i++) {
    const id = `PROD10${i.toString().padStart(2, '0')}`;
    const stock = i % 5 === 0 ? 3 : 50; // Every 5th product is low stock
    const product = {
      id,
      sku: `SKU-${1000 + i}`,
      name: `${CATEGORIES[i % CATEGORIES.length]} Unit ${i}`,
      category: CATEGORIES[i % CATEGORIES.length],
      unitPrice: 500 + (i * 100),
      availableStock: stock,
      reorderLevel: 10,
      status: stock <= 10 ? 'LOW STOCK' : 'IN STOCK',
      createdAt: serverTimestamp()
    };
    batch.set(doc(db, COLLECTIONS.PRODUCTS, id), product);
    products.push(product);
  }

  // 3. Seed 35 Sales Orders & Items
  const salesOrders = [];
  let itemCounter = 1;
  for (let i = 1; i <= 35; i++) {
    const id = `SO10${i.toString().padStart(2, '0')}`;
    const customer = customers[i % customers.length];
    const orderDate = subDays(new Date(), 40 - i);
    
    // Create 2-3 items per order
    let orderTotal = 0;
    const itemsCount = 2;
    for (let j = 0; j < itemsCount; j++) {
      const product = products[(i + j) % products.length];
      const qty = 2;
      const itemTotal = qty * product.unitPrice;
      const itemId = `ITEM${itemCounter++}`;
      
      batch.set(doc(db, COLLECTIONS.ORDER_ITEMS, itemId), {
        id: itemId,
        salesOrderId: id,
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: product.unitPrice,
        totalPrice: itemTotal
      });
      orderTotal += itemTotal;
    }

    const order = {
      id,
      customerId: customer.id,
      customerName: customer.name,
      orderDate: formatISO(orderDate),
      requestedDeliveryDate: formatISO(addDays(orderDate, 5)),
      totalAmount: orderTotal,
      status: i <= 10 ? "COMPLETED" : i <= 20 ? "SHIPPED" : i <= 30 ? "PROCESSING" : "NEW",
      createdAt: formatISO(orderDate),
      createdBy: userId
    };
    batch.set(doc(db, COLLECTIONS.SALES_ORDERS, id), order);
    salesOrders.push(order);
  }

  // 4. Seed 30 Deliveries (including 5 delayed)
  const deliveries = [];
  for (let i = 1; i <= 30; i++) {
    const id = `DEL10${i.toString().padStart(2, '0')}`;
    const order = salesOrders[i - 1];
    const isDelayed = i > 25; // Last 5 are delayed
    
    const delivery = {
      id,
      salesOrderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      expectedDeliveryDate: isDelayed ? formatISO(subDays(new Date(), 5)) : formatISO(addDays(new Date(), 3)),
      status: i <= 10 ? "DELIVERED" : i <= 20 ? "SHIPPED" : "PROCESSING",
      createdAt: serverTimestamp()
    };
    batch.set(doc(db, COLLECTIONS.DELIVERIES, id), delivery);
    deliveries.push(delivery);
  }

  // 5. Seed 25 Shipments
  const carriers = ["BlueDart", "DTDC", "Delhivery", "DHL", "FedEx"];
  for (let i = 1; i <= 25; i++) {
    const id = `SHIP10${i.toString().padStart(2, '0')}`;
    const delivery = deliveries[i - 1];
    
    batch.set(doc(db, COLLECTIONS.SHIPMENTS, id), {
      id,
      deliveryId: delivery.id,
      salesOrderId: delivery.salesOrderId,
      carrier: carriers[i % carriers.length],
      trackingNumber: `TRK-2026-${100000 + i}`,
      status: i <= 10 ? "DELIVERED" : "IN_TRANSIT",
      createdAt: serverTimestamp()
    });
  }

  // Finalize metadata
  batch.set(metaRef, {
    initialized: true,
    initializedAt: serverTimestamp(),
    datasetVersion: "1.0",
    counts: {
      customers: 25,
      products: 40,
      salesOrders: 35,
      deliveries: 30,
      shipments: 25
    }
  });

  await batch.commit();
}

import openaiClient from "../config/openai.js";
import { prisma } from "../config/db.js";



export async function processMessage(message) {
    const orderText = await extractOrder(message)
    const parsedProducts = orderText ? parseExtractedOrder(orderText) : null;

    const botResponse = await openaiClient.responses.create({
        model: "gpt-5-nano",
        instructions: "You are a helpful assistant for a natural products store called Natursur. Your task is to assist customers in placing their orders based on the provided order details. Be concise in your responses and response in Spanish. Dont ask for payment or shipping, just talk about products and quantities. If no order details were provided, ask the customer to repeat their order.",
        input: `You are an assistant for a natural products store called Natursur. A customer is trying to place an order with the following details:
        ${parsedProducts ? `Order details: ${JSON.stringify(parsedProducts)}` : "No order details were provided."}. The order details are just products and its quantities, if no details, say i didnt understand please repeat with good words and tell the client that the products are on the page https://natursur.herbalife.com/es-es/u.`,
    });

    const assistantText = (botResponse.output_text || "").trim();

    return {
      assistantText,
      parsedProducts
    };
}

async function extractOrder(message) {

    const instructions = `Extract the order details from the following message. Have in mind that the products can be, if they the products you receive have similar names, choose the closest one:
    - Crema de Ojos Nutritiva de HL
    - Gel Limpiador Renovador de HL
    - Herbalife Gels CoQ10Vita
    - Herbalife Gels ViewVita
    - Rebuild Strength de Herbalife24
    - Loción Nutritiva para Manos y Cuerpo de HL/Skin
    - Serúm con 10% de Niacinamida de HL/Skin
    - Herbalife24 Prologn Gel Energético
    - Herbalife Gels MindVita Kids
    - Herbalife Gels NutrientVita Kids
    - Herbalife24 Creatine+
    - Bebida con Proteínas en Polvo
    - Collagen Skin Booster
    - Phyto Complete
    - Formula 1 Alimento Equilibrado sabor Chocolate Cremoso
    - Formula 1 Alimento Equilibrado sabor Galleta Crujiente
    - Formula 1 Alimento Equilibrado sabor Crema de Vainilla
    - Formula 1 Alimento Equilibrado sabor Delicia de Fresa
    - Formula 1 Alimento Equilibrado sabor Frambuesa y Chocolate Blanco
    - Formula 1 Alimento Equilibrado sabor Menta y Chocolate
    - Formula 1 Alimento Equilibrado sabor Plátano
    - Formula 1 Alimento Equilibrado sabor Café Latte
    - Avena, Manzana y Fibra
    - Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Original
    - Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Durazno
    - Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Frambuesa
    - Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Limón
    - Concentrado Herbal Aloe sabor Original
    - Concentrado Herbal Aloe sabor Mango
    - Formula 3 Polvo de Proteínas
    - Herbalifeline Max
    - Desayuno Saludable sabor Café Latte
    - Desayuno Saludable sabor Galleta Crujiente
    - Desayuno Saludable sabor Chocolate Cremoso
    - Desayuno Saludable sabor Menta y Chocolate
    - Desayuno Saludable sabor Frambuesa y Chocolate Blanco
    - Desayuno Saludable sabor Delicia de Fresa
    - Desayuno Saludable sabor Crema de Vainilla
    - Desayuno Saludable sabor Plátano
    - Gel de Baño para Manos y Cuerpo de Herbal Aloe
    - Protein Chips sabor Barbacoa 
    - Protein Chips sabor Sour Cream and Onion
    - AloeMax
    - Paquete de prueba
    - Champú Fortalecedor de Herbal Aloe
    - Barritas con Proteínas sabor Limón
    - Barritas con Proteínas sabor Vainilla y Almendra
    - Niteworks
    - Bebida Vegana con Proteínas en Polvo
    - Immune Booster
    - Hydrate de Herbalife24
    - Restore de Herbalife24
    - Formula 2 Complejo de vitaminas y minerales para mujer
    - Barrita de Proteínas Achieve de Herbalife24 sabor Chocolate Negro
    - Barrita de Proteínas Achieve de Herbalife24 sabor Galleta con Trocitos de Chocolate
    - Barritas Formula 1 Express sabor Chocolate Negro
    - Barritas Formula 1 Express sabor Arándanos y Chocolate Blanco
    - LiftOff
    - Crema Hidratante con FPS30
    - Loción de Manos y Cuerpo de Herbal Aloe
    - Crema Revitalizante de Noche de Herbalife SKIN
    - Mascarilla Purificante de Arcilla con Menta de Herbalife SKIN
    - Xtra-Cal
    - Night Mode
    - Formula 2 Complejo de vitaminas y minerales para hombre
    - Tri Blend Select sabor Plátano
    - Tri Blend Select sabor Caramelo de Café
    - Active Mind Complex
    - Acondicionador Fortalecedor de Herbal Aloe
    - CR7 Drive de Herbalife24
    - High Protein Iced Coffe
    - Crema Tensora Ultimate

    Extract the products and their quantities in the following format:
    <Product Name>: <Quantity>, 
    <Product Name>: <Quantity>,
    If no products are found, respond with "No order details found".
`;
    const extractionResponse = await openaiClient.responses.create({
        model: "gpt-5-nano",
        instructions: instructions,
        input: message.message,
    });

    const extractedText = extractionResponse.output_text.trim();
    return extractedText === "No order details found" ? null : extractedText;
}

function parseExtractedOrder(text) {
  if (text.trim() === "No order details found") return {};

  const lines = text.split(",").map(l => l.trim()).filter(Boolean);

  const result = {};

  for (const line of lines) {
    const [product, quantity] = line.split(":").map(s => s.trim());
    if (product && quantity && !isNaN(quantity)) {
      result[product] = parseInt(quantity);
    }
  }

  return result;
}

export async function saveExtractedOrder(userId, parsedOrder) {
  // Normalize parsedOrder: allow { name: qty } or [{ name, quantity }]
  let items = [];

  if (!parsedOrder) {
    return { error: "No products provided" };
  }

  if (Array.isArray(parsedOrder)) {
    items = parsedOrder.map(p => ({ name: p.name, quantity: Number(p.quantity || p.qty) || 0 }));
  } else if (typeof parsedOrder === "object") {
    items = Object.entries(parsedOrder).map(([name, qty]) => ({ name, quantity: Number(qty || 0) }));
  } else {
    return { error: "Invalid products format" };
  }

  items = items.filter(it => it.name && it.quantity > 0);
  if (items.length === 0) {
    return { error: "No valid products to create order" };
  }

  // create order and items in a transaction
  const order = await prisma.order.create({
    data: {
      userId
    }
  });

  const warnings = [];

  for (const it of items) {
    const product = await prisma.product.findUnique({
      where: { name: it.name }
    });

    if (!product) {
      warnings.push(`Product not found: ${it.name}`);
      continue;
    }

    await prisma.orderProduct.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: it.quantity
      }
    });
  }

  const created = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      orderProducts: { include: { product: true } },
      user: true
    }
  });

  return { order: created, warnings };
}
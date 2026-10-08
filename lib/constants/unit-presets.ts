export interface UnitPreset {
  name: string;
  code: string;
  symbol: string;
  precision: number;
  category: "Quantity" | "Weight" | "Volume" | "Length";
  description: string;
}

export const STANDARD_UNIT_PRESETS: UnitPreset[] = [
  // Quantity / Count
  {
    name: "Piece",
    code: "PCS",
    symbol: "pcs",
    precision: 0,
    category: "Quantity",
    description: "Standard individual item count (e.g. 1 pcs, 5 pcs)",
  },
  {
    name: "Box",
    code: "BOX",
    symbol: "box",
    precision: 0,
    category: "Quantity",
    description: "Carton or packaged box of items",
  },
  {
    name: "Pack",
    code: "PK",
    symbol: "pk",
    precision: 0,
    category: "Quantity",
    description: "Multi-item bundle or blister pack",
  },
  {
    name: "Dozen",
    code: "DZN",
    symbol: "dz",
    precision: 0,
    category: "Quantity",
    description: "Standard 12-item collection",
  },
  {
    name: "Can",
    code: "CAN",
    symbol: "can",
    precision: 0,
    category: "Quantity",
    description: "Canned beverage or food item",
  },
  {
    name: "Bottle",
    code: "BTL",
    symbol: "btl",
    precision: 0,
    category: "Quantity",
    description: "Bottled beverage or liquid container",
  },
  {
    name: "Set",
    code: "SET",
    symbol: "set",
    precision: 0,
    category: "Quantity",
    description: "Composite kit or set of items",
  },

  // Weight / Mass
  {
    name: "Kilogram",
    code: "KG",
    symbol: "kg",
    precision: 2,
    category: "Weight",
    description: "Standard metric mass for weighed products (e.g. 1.25 kg)",
  },
  {
    name: "Gram",
    code: "G",
    symbol: "g",
    precision: 0,
    category: "Weight",
    description: "Small portions, dry goods or spices (e.g. 250 g)",
  },
  {
    name: "Pound",
    code: "LB",
    symbol: "lb",
    precision: 2,
    category: "Weight",
    description: "Imperial weight measure (e.g. 2.50 lb)",
  },

  // Volume / Liquid
  {
    name: "Liter",
    code: "LTR",
    symbol: "L",
    precision: 2,
    category: "Volume",
    description: "Standard metric liquid volume (e.g. 1.50 L)",
  },
  {
    name: "Milliliter",
    code: "ML",
    symbol: "ml",
    precision: 0,
    category: "Volume",
    description: "Small beverage portions or syrup measure (e.g. 330 ml)",
  },

  // Length / Dimension
  {
    name: "Meter",
    code: "MTR",
    symbol: "m",
    precision: 2,
    category: "Length",
    description: "Metric length for fabrics, wires, and materials (e.g. 3.50 m)",
  },
  {
    name: "Centimeter",
    code: "CM",
    symbol: "cm",
    precision: 1,
    category: "Length",
    description: "Dimension and packaging measurement (e.g. 25.5 cm)",
  },
];

export const POPULAR_PRESET_CODES = ["PCS", "KG", "LTR", "BOX", "G", "PK", "CAN", "MTR"];

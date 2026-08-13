export type BlockType =
  | "heading"
  | "paragraph"
  | "formula"
  | "figure"
  | "callout"
  | "list"
  | "simulation";

export type SimKind =
  | "circuit"
  | "forces"
  | "kinematics"
  | "projectile"
  | "gravitation"
  | "waves"
  | "sound"
  | "optics"
  | "electrostatics"
  | "electromagnetism"
  | "periodic-table"
  | "bonding"
  | "solutions"
  | "reactions"
  | "cell"
  | "photosynthesis"
  | "respiration"
  | "genetics"
  | "moments"
  | "energy"
  | "specific-heat"
  | "latent-heat"
  | "radiation"
  | "mirror"
  | "atom"
  | "redox"
  | "galvanic"
  | "electrolysis"
  | "displacement"
  | "ph"
  | "chromatography"
  | "biomolecules"
  | "microscope"
  | "osmosis"
  | "mitosis"
  | "meiosis"
  | "enzyme"
  | "locomotion"
  | "digestion"
  | "circulation"
  | "kidney"
  | "food-web"
  | "fermentation"
  | "reproduction"
  | "classification"
  | "gas-exchange"
  | "nervous"
  | "nuclear"
  | "fluids"
  | "refraction"
  | "transformer"
  | "logic-gates"
  | "thermal-expansion"
  | "heat-transfer"
  | "distillation"
  | "titration"
  | "momentum"
  | "hookes-law"
  | "pendulum"
  | "friction"
  | "gas-laws"
  | "rate-of-reaction"
  | "natural-selection"
  | "plant-transport"
  | "power"
  | "pressure"
  | "convection"
  | "echo"
  | "resonance"
  | "doppler"
  | "capacitor"
  | "series-parallel"
  | "motor"
  | "generator"
  | "photoelectric"
  | "circular-motion"
  | "centre-of-gravity"
  | "pulley"
  | "viscosity"
  | "surface-tension"
  | "calorimetry"
  | "thermal-equilibrium"
  | "earth-magnet"
  | "induction"
  | "acdc"
  | "telescope"
  | "fission"
  | "fusion"
  | "diffusion"
  | "crystallization"
  | "alloys"
  | "corrosion"
  | "electroplating"
  | "stoichiometry"
  | "alkanes"
  | "alkenes"
  | "polymers"
  | "soap"
  | "combustion"
  | "greenhouse"
  | "organelles"
  | "dna"
  | "protein-synthesis"
  | "immune"
  | "hormones"
  | "ear"
  | "pollination"
  | "germination"
  | "nitrogen-cycle"
  | "water-cycle"
  | "active-transport"
  | "vitamins"
  | "newtons-third-law"
  | "standing-waves"
  | "blood-groups"
  | "electromagnetic-spectrum"
  | "equilibrium"
  | "colligative-properties"
  | "organic-structures"
  | "carnot-engine"
  | "engine-cycles"
  | "ion-exchange";

export type CalloutVariant = "info" | "tip" | "warning" | "key";

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  formula?: string;
  items?: string[];
  variant?: CalloutVariant;
  caption?: string;
  sim?: SimKind;
  topic?: string;
  src?: string;
}

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Chapter {
  slug: string;
  title: string;
  subject: string;
  grade: string;
  shortDescription: string;
  keywords: string[];
  readingTime: number;
  sections: Section[];
}

export interface Book {
  title: string;
  subtitle: string;
  edition: string;
  chapters: Chapter[];
}

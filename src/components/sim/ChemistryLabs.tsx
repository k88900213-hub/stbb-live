"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

interface El {
  n: number;
  sym: string;
  name: string;
  row: number;
  col: number;
  cat: string;
  shells: number[];
}

const ELEMENTS: El[] = [
  { n: 1, sym: "H", name: "Hydrogen", row: 1, col: 1, cat: "nonmetal", shells: [1] },
  { n: 2, sym: "He", name: "Helium", row: 1, col: 18, cat: "noble", shells: [2] },
  { n: 3, sym: "Li", name: "Lithium", row: 2, col: 1, cat: "alkali", shells: [2, 1] },
  { n: 4, sym: "Be", name: "Beryllium", row: 2, col: 2, cat: "alkaline", shells: [2, 2] },
  { n: 5, sym: "B", name: "Boron", row: 2, col: 13, cat: "metalloid", shells: [2, 3] },
  { n: 6, sym: "C", name: "Carbon", row: 2, col: 14, cat: "nonmetal", shells: [2, 4] },
  { n: 7, sym: "N", name: "Nitrogen", row: 2, col: 15, cat: "nonmetal", shells: [2, 5] },
  { n: 8, sym: "O", name: "Oxygen", row: 2, col: 16, cat: "nonmetal", shells: [2, 6] },
  { n: 9, sym: "F", name: "Fluorine", row: 2, col: 17, cat: "halogen", shells: [2, 7] },
  { n: 10, sym: "Ne", name: "Neon", row: 2, col: 18, cat: "noble", shells: [2, 8] },
  { n: 11, sym: "Na", name: "Sodium", row: 3, col: 1, cat: "alkali", shells: [2, 8, 1] },
  { n: 12, sym: "Mg", name: "Magnesium", row: 3, col: 2, cat: "alkaline", shells: [2, 8, 2] },
  { n: 13, sym: "Al", name: "Aluminium", row: 3, col: 13, cat: "metal", shells: [2, 8, 3] },
  { n: 14, sym: "Si", name: "Silicon", row: 3, col: 14, cat: "metalloid", shells: [2, 8, 4] },
  { n: 15, sym: "P", name: "Phosphorus", row: 3, col: 15, cat: "nonmetal", shells: [2, 8, 5] },
  { n: 16, sym: "S", name: "Sulphur", row: 3, col: 16, cat: "nonmetal", shells: [2, 8, 6] },
  { n: 17, sym: "Cl", name: "Chlorine", row: 3, col: 17, cat: "halogen", shells: [2, 8, 7] },
  { n: 18, sym: "Ar", name: "Argon", row: 3, col: 18, cat: "noble", shells: [2, 8, 8] },
  { n: 19, sym: "K", name: "Potassium", row: 4, col: 1, cat: "alkali", shells: [2, 8, 8, 1] },
  { n: 20, sym: "Ca", name: "Calcium", row: 4, col: 2, cat: "alkaline", shells: [2, 8, 8, 2] },
  { n: 21, sym: "Sc", name: "Scandium", row: 4, col: 3, cat: "transition", shells: [2, 8, 9, 2] },
  { n: 22, sym: "Ti", name: "Titanium", row: 4, col: 4, cat: "transition", shells: [2, 8, 10, 2] },
  { n: 23, sym: "V", name: "Vanadium", row: 4, col: 5, cat: "transition", shells: [2, 8, 11, 2] },
  { n: 24, sym: "Cr", name: "Chromium", row: 4, col: 6, cat: "transition", shells: [2, 8, 13, 1] },
  { n: 25, sym: "Mn", name: "Manganese", row: 4, col: 7, cat: "transition", shells: [2, 8, 13, 2] },
  { n: 26, sym: "Fe", name: "Iron", row: 4, col: 8, cat: "transition", shells: [2, 8, 14, 2] },
  { n: 27, sym: "Co", name: "Cobalt", row: 4, col: 9, cat: "transition", shells: [2, 8, 15, 2] },
  { n: 28, sym: "Ni", name: "Nickel", row: 4, col: 10, cat: "transition", shells: [2, 8, 16, 2] },
  { n: 29, sym: "Cu", name: "Copper", row: 4, col: 11, cat: "transition", shells: [2, 8, 18, 1] },
  { n: 30, sym: "Zn", name: "Zinc", row: 4, col: 12, cat: "transition", shells: [2, 8, 18, 2] },
  { n: 31, sym: "Ga", name: "Gallium", row: 4, col: 13, cat: "metal", shells: [2, 8, 18, 3] },
  { n: 32, sym: "Ge", name: "Germanium", row: 4, col: 14, cat: "metalloid", shells: [2, 8, 18, 4] },
  { n: 33, sym: "As", name: "Arsenic", row: 4, col: 15, cat: "metalloid", shells: [2, 8, 18, 5] },
  { n: 34, sym: "Se", name: "Selenium", row: 4, col: 16, cat: "nonmetal", shells: [2, 8, 18, 6] },
  { n: 35, sym: "Br", name: "Bromine", row: 4, col: 17, cat: "halogen", shells: [2, 8, 18, 7] },
  { n: 36, sym: "Kr", name: "Krypton", row: 4, col: 18, cat: "noble", shells: [2, 8, 18, 8] },
  { n: 37, sym: "Rb", name: "Rubidium", row: 5, col: 1, cat: "alkali", shells: [2, 8, 18, 8, 1] },
  { n: 38, sym: "Sr", name: "Strontium", row: 5, col: 2, cat: "alkaline", shells: [2, 8, 18, 8, 2] },
  { n: 39, sym: "Y", name: "Yttrium", row: 5, col: 3, cat: "transition", shells: [2, 8, 18, 9, 2] },
  { n: 40, sym: "Zr", name: "Zirconium", row: 5, col: 4, cat: "transition", shells: [2, 8, 18, 10, 2] },
  { n: 41, sym: "Nb", name: "Niobium", row: 5, col: 5, cat: "transition", shells: [2, 8, 18, 12, 1] },
  { n: 42, sym: "Mo", name: "Molybdenum", row: 5, col: 6, cat: "transition", shells: [2, 8, 18, 13, 1] },
  { n: 43, sym: "Tc", name: "Technetium", row: 5, col: 7, cat: "transition", shells: [2, 8, 18, 13, 2] },
  { n: 44, sym: "Ru", name: "Ruthenium", row: 5, col: 8, cat: "transition", shells: [2, 8, 18, 15, 1] },
  { n: 45, sym: "Rh", name: "Rhodium", row: 5, col: 9, cat: "transition", shells: [2, 8, 18, 16, 1] },
  { n: 46, sym: "Pd", name: "Palladium", row: 5, col: 10, cat: "transition", shells: [2, 8, 18, 18] },
  { n: 47, sym: "Ag", name: "Silver", row: 5, col: 11, cat: "transition", shells: [2, 8, 18, 18, 1] },
  { n: 48, sym: "Cd", name: "Cadmium", row: 5, col: 12, cat: "transition", shells: [2, 8, 18, 18, 2] },
  { n: 49, sym: "In", name: "Indium", row: 5, col: 13, cat: "metal", shells: [2, 8, 18, 18, 3] },
  { n: 50, sym: "Sn", name: "Tin", row: 5, col: 14, cat: "metal", shells: [2, 8, 18, 18, 4] },
  { n: 51, sym: "Sb", name: "Antimony", row: 5, col: 15, cat: "metalloid", shells: [2, 8, 18, 18, 5] },
  { n: 52, sym: "Te", name: "Tellurium", row: 5, col: 16, cat: "metalloid", shells: [2, 8, 18, 18, 6] },
  { n: 53, sym: "I", name: "Iodine", row: 5, col: 17, cat: "halogen", shells: [2, 8, 18, 18, 7] },
  { n: 54, sym: "Xe", name: "Xenon", row: 5, col: 18, cat: "noble", shells: [2, 8, 18, 18, 8] },
  { n: 55, sym: "Cs", name: "Caesium", row: 6, col: 1, cat: "alkali", shells: [2, 8, 18, 18, 8, 1] },
  { n: 56, sym: "Ba", name: "Barium", row: 6, col: 2, cat: "alkaline", shells: [2, 8, 18, 18, 8, 2] },
  { n: 57, sym: "La", name: "Lanthanum", row: 9, col: 3, cat: "lanthanide", shells: [2, 8, 18, 18, 9, 2] },
  { n: 58, sym: "Ce", name: "Cerium", row: 9, col: 4, cat: "lanthanide", shells: [2, 8, 18, 19, 9, 2] },
  { n: 59, sym: "Pr", name: "Praseodymium", row: 9, col: 5, cat: "lanthanide", shells: [2, 8, 18, 21, 8, 2] },
  { n: 60, sym: "Nd", name: "Neodymium", row: 9, col: 6, cat: "lanthanide", shells: [2, 8, 18, 22, 8, 2] },
  { n: 61, sym: "Pm", name: "Promethium", row: 9, col: 7, cat: "lanthanide", shells: [2, 8, 18, 23, 8, 2] },
  { n: 62, sym: "Sm", name: "Samarium", row: 9, col: 8, cat: "lanthanide", shells: [2, 8, 18, 24, 8, 2] },
  { n: 63, sym: "Eu", name: "Europium", row: 9, col: 9, cat: "lanthanide", shells: [2, 8, 18, 25, 8, 2] },
  { n: 64, sym: "Gd", name: "Gadolinium", row: 9, col: 10, cat: "lanthanide", shells: [2, 8, 18, 25, 9, 2] },
  { n: 65, sym: "Tb", name: "Terbium", row: 9, col: 11, cat: "lanthanide", shells: [2, 8, 18, 27, 8, 2] },
  { n: 66, sym: "Dy", name: "Dysprosium", row: 9, col: 12, cat: "lanthanide", shells: [2, 8, 18, 28, 8, 2] },
  { n: 67, sym: "Ho", name: "Holmium", row: 9, col: 13, cat: "lanthanide", shells: [2, 8, 18, 29, 8, 2] },
  { n: 68, sym: "Er", name: "Erbium", row: 9, col: 14, cat: "lanthanide", shells: [2, 8, 18, 30, 8, 2] },
  { n: 69, sym: "Tm", name: "Thulium", row: 9, col: 15, cat: "lanthanide", shells: [2, 8, 18, 31, 8, 2] },
  { n: 70, sym: "Yb", name: "Ytterbium", row: 9, col: 16, cat: "lanthanide", shells: [2, 8, 18, 32, 8, 2] },
  { n: 71, sym: "Lu", name: "Lutetium", row: 9, col: 17, cat: "lanthanide", shells: [2, 8, 18, 32, 9, 2] },
  { n: 72, sym: "Hf", name: "Hafnium", row: 6, col: 4, cat: "transition", shells: [2, 8, 18, 32, 10, 2] },
  { n: 73, sym: "Ta", name: "Tantalum", row: 6, col: 5, cat: "transition", shells: [2, 8, 18, 32, 11, 2] },
  { n: 74, sym: "W", name: "Tungsten", row: 6, col: 6, cat: "transition", shells: [2, 8, 18, 32, 12, 2] },
  { n: 75, sym: "Re", name: "Rhenium", row: 6, col: 7, cat: "transition", shells: [2, 8, 18, 32, 13, 2] },
  { n: 76, sym: "Os", name: "Osmium", row: 6, col: 8, cat: "transition", shells: [2, 8, 18, 32, 14, 2] },
  { n: 77, sym: "Ir", name: "Iridium", row: 6, col: 9, cat: "transition", shells: [2, 8, 18, 32, 15, 2] },
  { n: 78, sym: "Pt", name: "Platinum", row: 6, col: 10, cat: "transition", shells: [2, 8, 18, 32, 17, 1] },
  { n: 79, sym: "Au", name: "Gold", row: 6, col: 11, cat: "transition", shells: [2, 8, 18, 32, 18, 1] },
  { n: 80, sym: "Hg", name: "Mercury", row: 6, col: 12, cat: "transition", shells: [2, 8, 18, 32, 18, 2] },
  { n: 81, sym: "Tl", name: "Thallium", row: 6, col: 13, cat: "metal", shells: [2, 8, 18, 32, 18, 3] },
  { n: 82, sym: "Pb", name: "Lead", row: 6, col: 14, cat: "metal", shells: [2, 8, 18, 32, 18, 4] },
  { n: 83, sym: "Bi", name: "Bismuth", row: 6, col: 15, cat: "metal", shells: [2, 8, 18, 32, 18, 5] },
  { n: 84, sym: "Po", name: "Polonium", row: 6, col: 16, cat: "metalloid", shells: [2, 8, 18, 32, 18, 6] },
  { n: 85, sym: "At", name: "Astatine", row: 6, col: 17, cat: "halogen", shells: [2, 8, 18, 32, 18, 7] },
  { n: 86, sym: "Rn", name: "Radon", row: 6, col: 18, cat: "noble", shells: [2, 8, 18, 32, 18, 8] },
  { n: 87, sym: "Fr", name: "Francium", row: 7, col: 1, cat: "alkali", shells: [2, 8, 18, 32, 18, 8, 1] },
  { n: 88, sym: "Ra", name: "Radium", row: 7, col: 2, cat: "alkaline", shells: [2, 8, 18, 32, 18, 8, 2] },
  { n: 89, sym: "Ac", name: "Actinium", row: 10, col: 3, cat: "actinide", shells: [2, 8, 18, 32, 18, 9, 2] },
  { n: 90, sym: "Th", name: "Thorium", row: 10, col: 4, cat: "actinide", shells: [2, 8, 18, 32, 18, 10, 2] },
  { n: 91, sym: "Pa", name: "Protactinium", row: 10, col: 5, cat: "actinide", shells: [2, 8, 18, 32, 20, 9, 2] },
  { n: 92, sym: "U", name: "Uranium", row: 10, col: 6, cat: "actinide", shells: [2, 8, 18, 32, 21, 9, 2] },
  { n: 93, sym: "Np", name: "Neptunium", row: 10, col: 7, cat: "actinide", shells: [2, 8, 18, 32, 22, 9, 2] },
  { n: 94, sym: "Pu", name: "Plutonium", row: 10, col: 8, cat: "actinide", shells: [2, 8, 18, 32, 24, 8, 2] },
  { n: 95, sym: "Am", name: "Americium", row: 10, col: 9, cat: "actinide", shells: [2, 8, 18, 32, 25, 8, 2] },
  { n: 96, sym: "Cm", name: "Curium", row: 10, col: 10, cat: "actinide", shells: [2, 8, 18, 32, 25, 9, 2] },
  { n: 97, sym: "Bk", name: "Berkelium", row: 10, col: 11, cat: "actinide", shells: [2, 8, 18, 32, 27, 8, 2] },
  { n: 98, sym: "Cf", name: "Californium", row: 10, col: 12, cat: "actinide", shells: [2, 8, 18, 32, 28, 8, 2] },
  { n: 99, sym: "Es", name: "Einsteinium", row: 10, col: 13, cat: "actinide", shells: [2, 8, 18, 32, 29, 8, 2] },
  { n: 100, sym: "Fm", name: "Fermium", row: 10, col: 14, cat: "actinide", shells: [2, 8, 18, 32, 30, 8, 2] },
  { n: 101, sym: "Md", name: "Mendelevium", row: 10, col: 15, cat: "actinide", shells: [2, 8, 18, 32, 31, 8, 2] },
  { n: 102, sym: "No", name: "Nobelium", row: 10, col: 16, cat: "actinide", shells: [2, 8, 18, 32, 32, 8, 2] },
  { n: 103, sym: "Lr", name: "Lawrencium", row: 10, col: 17, cat: "actinide", shells: [2, 8, 18, 32, 32, 9, 2] },
  { n: 104, sym: "Rf", name: "Rutherfordium", row: 7, col: 4, cat: "transition", shells: [2, 8, 18, 32, 32, 10, 2] },
  { n: 105, sym: "Db", name: "Dubnium", row: 7, col: 5, cat: "transition", shells: [2, 8, 18, 32, 32, 11, 2] },
  { n: 106, sym: "Sg", name: "Seaborgium", row: 7, col: 6, cat: "transition", shells: [2, 8, 18, 32, 32, 12, 2] },
  { n: 107, sym: "Bh", name: "Bohrium", row: 7, col: 7, cat: "transition", shells: [2, 8, 18, 32, 32, 13, 2] },
  { n: 108, sym: "Hs", name: "Hassium", row: 7, col: 8, cat: "transition", shells: [2, 8, 18, 32, 32, 14, 2] },
  { n: 109, sym: "Mt", name: "Meitnerium", row: 7, col: 9, cat: "transition", shells: [2, 8, 18, 32, 32, 15, 2] },
  { n: 110, sym: "Ds", name: "Darmstadtium", row: 7, col: 10, cat: "transition", shells: [2, 8, 18, 32, 32, 16, 2] },
  { n: 111, sym: "Rg", name: "Roentgenium", row: 7, col: 11, cat: "transition", shells: [2, 8, 18, 32, 32, 17, 2] },
  { n: 112, sym: "Cn", name: "Copernicium", row: 7, col: 12, cat: "transition", shells: [2, 8, 18, 32, 32, 18, 2] },
  { n: 113, sym: "Nh", name: "Nihonium", row: 7, col: 13, cat: "metal", shells: [2, 8, 18, 32, 32, 18, 3] },
  { n: 114, sym: "Fl", name: "Flerovium", row: 7, col: 14, cat: "metal", shells: [2, 8, 18, 32, 32, 18, 4] },
  { n: 115, sym: "Mc", name: "Moscovium", row: 7, col: 15, cat: "metal", shells: [2, 8, 18, 32, 32, 18, 5] },
  { n: 116, sym: "Lv", name: "Livermorium", row: 7, col: 16, cat: "metal", shells: [2, 8, 18, 32, 32, 18, 6] },
  { n: 117, sym: "Ts", name: "Tennessine", row: 7, col: 17, cat: "halogen", shells: [2, 8, 18, 32, 32, 18, 7] },
  { n: 118, sym: "Og", name: "Oganesson", row: 7, col: 18, cat: "noble", shells: [2, 8, 18, 32, 32, 18, 8] },
];

const CAT_COLORS: Record<string, string> = {
  alkali: "#f87171",
  alkaline: "#fb923c",
  transition: "#2dd4bf",
  metal: "#a5b4fc",
  metalloid: "#facc15",
  nonmetal: "#86efac",
  halogen: "#c084fc",
  noble: "#93c5fd",
  lanthanide: "#f472b6",
  actinide: "#e879f9",
};

const ATOMIC_MASS: Record<number, number> = {
  1: 1.008, 2: 4.003, 3: 6.94, 4: 9.012, 5: 10.81, 6: 12.011, 7: 14.007, 8: 15.999, 9: 18.998, 10: 20.18,
  11: 22.99, 12: 24.305, 13: 26.982, 14: 28.085, 15: 30.974, 16: 32.06, 17: 35.45, 18: 39.948, 19: 39.098, 20: 40.078,
  21: 44.956, 22: 47.867, 23: 50.942, 24: 51.996, 25: 54.938, 26: 55.845, 27: 58.933, 28: 58.693, 29: 63.546, 30: 65.38,
  31: 69.723, 32: 72.63, 33: 74.922, 34: 78.971, 35: 79.904, 36: 83.798, 37: 85.468, 38: 87.62, 39: 88.906, 40: 91.224,
  41: 92.906, 42: 95.95, 43: 98, 44: 101.07, 45: 102.906, 46: 106.42, 47: 107.868, 48: 112.414, 49: 114.818, 50: 118.71,
  51: 121.76, 52: 127.6, 53: 126.904, 54: 131.293, 55: 132.905, 56: 137.327, 57: 138.905, 58: 140.116, 59: 140.908, 60: 144.242,
  61: 145, 62: 150.36, 63: 151.964, 64: 157.25, 65: 158.925, 66: 162.5, 67: 164.93, 68: 167.259, 69: 168.934, 70: 173.045,
  71: 174.967, 72: 178.49, 73: 180.948, 74: 183.84, 75: 186.207, 76: 190.23, 77: 192.217, 78: 195.084, 79: 196.967, 80: 200.592,
  81: 204.38, 82: 207.2, 83: 208.98, 84: 209, 85: 210, 86: 222, 87: 223, 88: 226, 89: 227, 90: 232.038,
  91: 231.036, 92: 238.029, 93: 237, 94: 244, 95: 243, 96: 247, 97: 247, 98: 251, 99: 252, 100: 257,
  101: 258, 102: 259, 103: 266, 104: 267, 105: 268, 106: 269, 107: 270, 108: 277, 109: 278, 110: 281,
  111: 282, 112: 285, 113: 286, 114: 289, 115: 290, 116: 293, 117: 294, 118: 294,
};

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

function toSuper(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUP[d] ?? d)
    .join("");
}

function electronConfig(shells: number[]): string {
  const parts: string[] = [];
  shells.forEach((count, s) => {
    const n = s + 1;
    let rem = count;
    const fill = (orb: string, cap: number) => {
      if (rem <= 0) return;
      const take = Math.min(cap, rem);
      parts.push(`${n}${orb}${toSuper(take)}`);
      rem -= take;
    };
    fill("s", 2);
    fill("p", 6);
    fill("d", 10);
    fill("f", 14);
  });
  return parts.join(" ");
}

export function PeriodicTableSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [selected, setSelected] = useState<El>(ELEMENTS[5]);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const electrons = selected.shells.reduce((x, y) => x + y, 0);
  const valence = selected.shells[selected.shells.length - 1];
  const mass = Math.round(ATOMIC_MASS[selected.n] ?? selected.n * 2);
  const neutrons = Math.max(0, mass - selected.n);
  const cfg = electronConfig(selected.shells);
  const fBlock = selected.cat === "lanthanide" || selected.cat === "actinide";
  const displayPeriod = fBlock ? (selected.row === 9 ? 6 : 7) : selected.row;
  const displayGroup = fBlock ? 3 : selected.col;
  return (
    <SimShell
      icon="🧪"
      title={simTitle(topic, "Interactive periodic table")}
      accent="violet"
      subtitle={`${topic ?? "Periodic table"} — click any element. The table is arranged by atomic number, with elements in the same group (column) sharing similar properties.`}
      hint="Groups (columns) have similar chemical behaviour. Metals sit on the left, non-metals on the right, and the noble gases are unreactive."
      controls={<SimChip accent="violet"><span aria-hidden>🧪</span>{topic ?? "periodic table"}</SimChip>}
    >
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
        {ELEMENTS.map((el) => (
          <button
            key={el.sym}
            type="button"
            onClick={() => setSelected(el)}
            title={el.name}
            className="rounded-[3px] border px-0.5 py-1 text-center transition"
            style={{ gridColumnStart: el.col, gridRowStart: el.row, backgroundColor: CAT_COLORS[el.cat], borderColor: selected.n === el.n ? "#111827" : "rgba(255,255,255,0.6)" }}
          >
            <span className="block text-[9px] leading-none font-semibold text-slate-900/70">{el.n}</span>
            <span className="block text-[11px] leading-tight font-bold text-slate-900">{el.sym}</span>
          </button>
        ))}
        <div
          className="flex items-center justify-center rounded-[3px] border border-dashed border-slate-400/40 text-[9px] font-semibold text-slate-500"
          style={{ gridColumn: "3 / 13", gridRowStart: 6 }}
        >
          57–71
        </div>
        <div
          className="flex items-center justify-center rounded-[3px] border border-dashed border-slate-400/40 text-[9px] font-semibold text-slate-500"
          style={{ gridColumn: "3 / 13", gridRowStart: 7 }}
        >
          89–103
        </div>
        <div
          className="flex items-center justify-center rounded-[3px] border border-dashed border-slate-400/40 text-[9px] font-semibold text-slate-500"
          style={{ gridColumn: "1 / 3", gridRowStart: 9 }}
        >
          Lanthanides
        </div>
        <div
          className="flex items-center justify-center rounded-[3px] border border-dashed border-slate-400/40 text-[9px] font-semibold text-slate-500"
          style={{ gridColumn: "1 / 3", gridRowStart: 10 }}
        >
          Actinides
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        {Object.entries(CAT_COLORS).map(([k, c]) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
            {k}
          </span>
        ))}
      </div>
      <SimCanvas
        deps={[selected, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = 140;
          const cy = h / 2;
          const shells = selected.shells;
          const maxR = shells.length * 22 + 16;
          const k = Math.min(1, 108 / maxR);
          ctx.fillStyle = CAT_COLORS[selected.cat] + "55";
          ctx.beginPath();
          ctx.arc(cx, cy, maxR * k, 0, Math.PI * 2);
          ctx.fill();
          const prot = selected.n;
          for (let s = 0; s < shells.length; s++) {
            const r = (20 + s * 22) * k;
            ctx.strokeStyle = "#7c3aed";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            const count = shells[s];
            for (let e = 0; e < count; e++) {
              const ang = (e / count) * Math.PI * 2 + sim.tick * 0.03;
              const x = cx + Math.cos(ang) * r;
              const y = cy + Math.sin(ang) * r;
              ctx.beginPath();
              ctx.arc(x, y, 3.2, 0, Math.PI * 2);
              ctx.fillStyle = "#0ea5e9";
              ctx.fill();
            }
          }
          ctx.beginPath();
          ctx.arc(cx, cy, 11, 0, Math.PI * 2);
          ctx.fillStyle = "#e11d48";
          ctx.fill();
          ctx.strokeStyle = "#7f1d1d";
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px system-ui";
          ctx.fillText(`${prot}`, cx - 4, cy + 4);
          ctx.fillStyle = "#3b0764";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(`${selected.sym} — ${selected.name}`, 210, 80);
          ctx.font = "12px system-ui";
          ctx.fillText(`atomic number ${selected.n}`, 210, 100);
          ctx.fillText(`protons ${prot} · neutrons ${neutrons} · electrons ${electrons}`, 210, 118);
          ctx.fillText(`shells: ${shells.join(" · ")}`, 210, 136);
          ctx.fillStyle = "#6d28d9";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`config: ${cfg}`, 210, 154);
          ctx.fillText(`valence ${valence}e⁻ · group ${displayGroup} · period ${displayPeriod}`, 210, 170);
          ctx.fillStyle = "#334155";
          ctx.fillText(
            fBlock
              ? "f-block element — f-subshell filling"
              : selected.cat === "transition"
                ? "transition element — d-subshell filling"
                : selected.n === 1
                  ? "one proton, one electron"
                  : `octet rule: outermost shell wants ${valence >= 5 ? "8" : "its full capacity"}`,
            210,
            188,
          );
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Element" value={`${selected.sym} · ${selected.name}`} accent={at} />
        <Stat label="Atomic number" value={`${selected.n}`} accent={at} />
        <Stat label="Valence e⁻" value={`${valence}`} accent={at} />
        <Stat label="Neutrons" value={`${neutrons} (mass ${mass})`} accent={at} />
      </div>
    </SimShell>
  );
}

export function BondingSim({ topic }: { topic?: string }) {
  const a = "#10b981";
  const at = "text-emerald-600 dark:text-emerald-400";
  const [mode, setMode] = useState<"ionic" | "covalent">("ionic");
  const [enDiff, setEnDiff] = useState(2.1);
  const [showBond, setShowBond] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const ionic = mode === "ionic";
  const ionicPct = Math.min(100, (1 - Math.exp(-0.25 * enDiff * enDiff)) * 100);
  const transfer = (sim.tick % 120) / 120;
  const tPos = transfer * 110;
  return (
    <SimShell
      icon="⚛️"
      title={simTitle(topic, "Chemical bonding")}
      accent="emerald"
      subtitle={`${topic ?? "Bonding"} — ionic bonds transfer electrons between metal and non-metal; covalent bonds share electrons between non-metals.`}
      hint="A big electronegativity difference (like Na–Cl) makes ionic bonding; a small difference makes covalent (like H–O)."
      controls={<SimChip accent="emerald"><span aria-hidden>⚛️</span>{topic ?? "chemical bonding"}</SimChip>}
    >
      <SimCanvas
        deps={[mode, enDiff, showBond, transfer, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          const lx = 130;
          const rx = w - 130;
          const atom = (x: number, r: number, color: string, label: string) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, cy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#064e3b";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px system-ui";
            ctx.fillText(label, x - 12, cy + 5);
          };
          if (ionic) {
            atom(lx, 34, "#f87171", "Na⁺");
            atom(rx, 34, "#60a5fa", "Cl⁻");
            ctx.strokeStyle = "#10b981";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(lx + 34, cy);
            ctx.lineTo(rx - 34, cy);
            ctx.stroke();
            ctx.setLineDash([]);
            if (transfer < 1) {
              ctx.beginPath();
              ctx.arc(lx + 34 + tPos, cy, 6, 0, Math.PI * 2);
              ctx.fillStyle = "#a7f3d0";
              ctx.fill();
              ctx.strokeStyle = "#047857";
              ctx.stroke();
              ctx.fillStyle = "#047857";
              ctx.font = "bold 11px system-ui";
              ctx.fillText("e⁻", lx + 28 + tPos, cy - 10);
            }
            ctx.fillStyle = "#065f46";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("electron transferred → Na⁺ Cl⁻", 30, 30);
            ctx.fillText("opposite charges attract (electrostatic)", 30, 48);
          } else {
            const r = 30;
            atom(lx, r, "#34d399", "O");
            atom(rx, r, "#34d399", "O");
            const sharedX = (lx + rx) / 2;
            ctx.fillStyle = "#065f46";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("shared electrons orbit both nuclei", 30, 30);
            if (showBond) {
              for (let e = 0; e < 4; e++) {
                const ang = (e / 4) * Math.PI * 2 + sim.tick * 0.08;
                const x = sharedX + Math.cos(ang) * 14;
                const y = cy + Math.sin(ang) * 14;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#047857";
                ctx.fill();
              }
            }
            ctx.strokeStyle = "#059669";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lx + r, cy);
            ctx.lineTo(rx - r, cy);
            ctx.stroke();
          }
          ctx.fillStyle = "#065f46";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(
            `electronegativity difference ${enDiff.toFixed(1)} — ~${ionicPct.toFixed(0)}% ionic character`,
            30,
            h - 20,
          );
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton label="Ionic bond" onClick={() => setMode("ionic")} hex={mode === "ionic" ? a : "#94a3b8"} />
        <ActionButton label="Covalent bond" onClick={() => setMode("covalent")} hex={mode === "covalent" ? a : "#94a3b8"} />
      </div>
      <div className="mt-3">
        <Slider label="Electronegativity difference" value={enDiff} min={0.4} max={3} step={0.1} hex={a} accent={at} onChange={setEnDiff} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show shared pair" checked={showBond} onChange={setShowBond} hex={a} hint="covalent only" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Bond type" value={ionic ? "ionic" : "covalent"} accent={at} />
        <Stat label="Electron" value={ionic ? "transferred" : "shared"} accent={at} />
        <Stat label="Example" value={ionic ? "NaCl, MgO" : "H2O, CO2"} accent={at} />
      </div>
    </SimShell>
  );
}

export function SolutionSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [solute, setSolute] = useState(2);
  const [volume, setVolume] = useState(500);
  const [stir, setStir] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const molarity = (solute / 1000) * 1000 / (volume / 1000) / 58.5;
  const dissolved = stir ? Math.min(1, sim.tick / 40) : Math.min(0.3, sim.tick / 40);
  const particles = Math.round(30 * dissolved);
  const color = molarity < 0.5 ? "#bae6fd" : molarity < 1.5 ? "#7dd3fc" : molarity < 3 ? "#38bdf8" : "#0ea5e9";
  return (
    <SimShell
      icon="💧"
      title={simTitle(topic, "Solutions & concentration")}
      accent="sky"
      subtitle={`${topic ?? "Solutions"} — concentration = amount of solute ÷ volume. Molarity M = moles per litre. Stirring dissolves solute faster.`}
      hint="More solute or less water means a more concentrated solution. Dilution adds water, lowering the concentration."
      controls={<SimChip accent="sky"><span aria-hidden>💧</span>{topic ?? "solutions"}</SimChip>}
    >
      <SimCanvas
        deps={[solute, volume, molarity, dissolved, particles, color, stir, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const bx = 90;
          const by = 60;
          const bw = 150;
          const bh = 170;
          ctx.strokeStyle = "#0c4a6e";
          ctx.lineWidth = 3;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.fillStyle = color;
          ctx.fillRect(bx, by, bw, bh);
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillRect(bx + 20, by + 8, 10, bh - 40);
          ctx.save();
          ctx.beginPath();
          ctx.rect(bx, by, bw, bh);
          ctx.clip();
          const speed = stir ? 2 : 0.4;
          for (let i = 0; i < particles; i++) {
            const x = bx + 10 + ((i * 47 + sim.tick * speed * (stir ? (i % 2 === 0 ? 1 : -1) : 1)) % (bw - 20));
            const y = by + 10 + ((i * 83 + sim.tick * speed) % (bh - 20));
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "#0284c7";
            ctx.fill();
          }
          ctx.restore();
          const liq = (1 - dissolved) * (solute / 2) * 8;
          ctx.fillStyle = "#e0f2fe";
          for (let i = 0; i < Math.round(liq); i++) {
            const x = bx + 12 + ((i * 61) % (bw - 24));
            const y = by + 26 + ((i * 71) % 30);
            ctx.fillStyle = "#f0f9ff";
            ctx.fillRect(x, y, 9, 5);
            ctx.strokeStyle = "#7dd3fc";
            ctx.strokeRect(x, y, 9, 5);
          }
          ctx.fillStyle = "#075985";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("solution", bx + 40, by - 10);
          ctx.fillText(`${molarity.toFixed(2)} M`, bx + 30, by + 20);
          const gx = 300;
          ctx.strokeStyle = "#94a3b8";
          ctx.beginPath();
          ctx.moveTo(gx, h - 40);
          ctx.lineTo(w - 30, h - 40);
          ctx.moveTo(gx, h - 40);
          ctx.lineTo(gx, 40);
          ctx.stroke();
          ctx.fillStyle = "#64748b";
          ctx.font = "11px system-ui";
          ctx.fillText("0", gx + 4, h - 26);
          ctx.fillText("conc.", gx + 4, 44);
          const pct = Math.min(1, molarity / 4);
          ctx.fillStyle = color;
          ctx.fillRect(gx + 4, h - 40 - pct * 150, 22, pct * 150);
          ctx.strokeStyle = "#0c4a6e";
          ctx.strokeRect(gx + 4, h - 40 - pct * 150, 22, pct * 150);
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${(pct * 100).toFixed(0)}% full`, gx + 34, h - 40 - pct * 150 + 5);
          ctx.fillStyle = "#075985";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(stir && dissolved < 1 ? "stirring — dissolving…" : dissolved >= 1 ? "fully dissolved" : "still solids at bottom", 300, 26);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Solute (salt)" value={solute} min={0} max={20} step={1} hex={a} accent={at} unit=" g" onChange={setSolute} />
        <Slider label="Water volume" value={volume} min={100} max={1000} step={50} hex={a} accent={at} unit=" mL" onChange={setVolume} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Stirring" checked={stir} onChange={setStir} hex={a} hint="speeds up dissolving" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Concentration" value={`${molarity.toFixed(2)} M`} accent={at} />
        <Stat label="Solute" value={`${solute} g`} accent={at} />
        <Stat label="Solvent" value={`${volume} mL`} accent={at} />
      </div>
    </SimShell>
  );
}

interface ReactionSpec {
  name: string;
  left: string[];
  right: string[];
  count: number[][];
}

const REACTIONS: ReactionSpec[] = [
  { name: "Combustion of methane", left: ["CH4", "O2"], right: ["CO2", "H2O"], count: [[1, 2], [1, 2]] },
  { name: "Formation of water", left: ["H2", "O2"], right: ["H2O"], count: [[2, 1], [2]] },
  { name: "Synthesis of ammonia", left: ["N2", "H2"], right: ["NH3"], count: [[1, 3], [2]] },
];

export function ReactionSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const [reaction, setReaction] = useState(0);
  const [coeffs, setCoeffs] = useState<number[]>([1, 2, 1, 2]);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const spec = REACTIONS[reaction];
  const ideal = [...spec.count[0], ...spec.count[1]];
  const balanced = ideal.every((v, i) => coeffs[i] === v);
  const species = [...spec.left, ...spec.right];
  const setCoeff = (i: number, v: number) => setCoeffs((c) => c.map((x, j) => (j === i ? v : x)));
  const phase = (sim.tick % 60) / 60;
  return (
    <SimShell
      icon="⚗️"
      title={simTitle(topic, "Balancing chemical equations")}
      accent="amber"
      subtitle={`${topic ?? "Chemical reactions"} — atoms are conserved. Pick a reaction, set the coefficients, and make the atoms balance on both sides.`}
      hint={`Balanced: ${ideal.join(" ")}. Atoms of each element must be equal on both sides of the arrow.`}
      controls={<SimChip accent="amber"><span aria-hidden>⚗️</span>{topic ?? "chemical reactions"}</SimChip>}
    >
      <SimCanvas
        deps={[reaction, coeffs, balanced, species, phase, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const colors = ["#f59e0b", "#0ea5e9", "#10b981", "#8b5cf6"];
          const cx = w / 2;
          const cy = h / 2;
          const drawMolecule = (x: number, y: number, color: string, label: string, scale: number) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x - 12 * scale, y, 12 * scale, 0, Math.PI * 2);
            ctx.arc(x + 12 * scale, y, 12 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 12 * scale, y);
            ctx.lineTo(x + 12 * scale, y);
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.font = `bold ${10 * scale}px system-ui`;
            ctx.fillText(label, x - 12 * scale, y + 4 * scale);
          };
          species.forEach((s, i) => {
            const isLeft = i < spec.left.length;
            const x = isLeft ? 80 + i * 110 : 350 + (i - spec.left.length) * 110;
            const n = coeffs[i];
            const show = balanced || i < spec.left.length ? true : coeffs[i] > 0;
            if (!show) return;
            for (let k = 0; k < Math.min(3, n); k++) {
              const xo = x + (k - (Math.min(3, n) - 1) / 2) * 40;
              const yo = cy + Math.sin(phase * Math.PI * 2 + i) * 4;
              drawMolecule(xo, yo, colors[i], s, 1);
            }
            ctx.fillStyle = "#78350f";
            ctx.font = "bold 11px system-ui";
            ctx.fillText(`×${n}`, x, h - 40);
          });
          ctx.fillStyle = "#b45309";
          ctx.font = "bold 20px system-ui";
          ctx.fillText("→", cx - 8, cy + 6);
          ctx.fillStyle = balanced ? "#047857" : "#b91c1c";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(balanced ? "BALANCED — atoms conserved ✓" : "not balanced yet", 30, 28);
          ctx.fillStyle = "#78350f";
          ctx.font = "12px system-ui";
          ctx.fillText(spec.name, 30, 48);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {REACTIONS.map((r, i) => (
          <ActionButton key={r.name} label={r.name.split(" ")[0]} onClick={() => setReaction(i)} hex={reaction === i ? a : "#94a3b8"} title={r.name} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {species.map((s, i) => (
          <label key={s} className="block">
            <span className="mb-1 flex justify-between text-sm text-foreground/70">
              <span>{s}</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{coeffs[i]}</span>
            </span>
            <input type="range" min={0} max={5} step={1} value={coeffs[i]} onChange={(e) => setCoeff(i, Number(e.target.value))} className="w-full" style={{ accentColor: a }} />
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <ActionButton label="Set balanced" icon="✓" onClick={() => setCoeffs([...ideal])} hex={a} disabled={balanced} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Reactants" value={spec.left.join(" + ")} accent={at} />
        <Stat label="Products" value={spec.right.join(" + ")} accent={at} />
        <Stat label="Status" value={balanced ? "balanced" : "imbalanced"} accent={balanced ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
      </div>
    </SimShell>
  );
}

export function AtomSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [element, setElement] = useState(6);
  const [showLabels, setShowLabels] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const protons = element;
  const mass = Math.round(ATOMIC_MASS[element] ?? element * 2);
  const neutronCount = Math.max(0, mass - protons);
  const shells: number[] = [];
  let remaining = element;
  const caps = [2, 8, 18, 32];
  for (const c of caps) {
    if (remaining <= 0) break;
    shells.push(Math.min(c, remaining));
    remaining -= Math.min(c, remaining);
  }
  const valence = shells[shells.length - 1];
  const cfg = electronConfig(shells);
  const noble = valence === (element === 2 ? 2 : 8) || element === 2;
  return (
    <SimShell
      icon="🟠"
      title={simTitle(topic, "Bohr model of the atom")}
      accent="rose"
      subtitle={`${topic ?? "Structure of atoms"} — electrons orbit the nucleus in shells. First shell holds 2, then 8, then 18 electrons.`}
      hint="Change the element and watch the shells fill. Atoms are most stable with a full outer shell — the octet rule."
      controls={<SimChip accent="rose"><span aria-hidden>🟠</span>{topic ?? "bohr model"}</SimChip>}
    >
      <SimCanvas
        deps={[element, shells, protons, neutronCount, showLabels, cfg, valence, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = h / 2;
          ctx.fillStyle = "#1e1b4b";
          ctx.fillRect(0, 0, w, h);
          for (let s = 0; s < shells.length; s++) {
            const r = 18 + s * 24;
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            if (showLabels) {
              ctx.fillStyle = "#64748b";
              ctx.font = "10px system-ui";
              ctx.fillText(`n=${s + 1}`, cx + r + 6, cy - 6);
              ctx.fillText(`l=s,p`, cx + r + 6, cy + 6);
            }
            const count = shells[s];
            for (let e = 0; e < count; e++) {
              const ang = (e / count) * Math.PI * 2 + sim.tick * 0.05 * (s + 1);
              const x = cx + Math.cos(ang) * r;
              const y = cy + Math.sin(ang) * r;
              ctx.beginPath();
              ctx.arc(x, y, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = "#38bdf8";
              ctx.fill();
            }
            if (showLabels) {
              ctx.fillStyle = "#cbd5e1";
              ctx.font = "10px system-ui";
              ctx.fillText(`${count}`, cx + r + 8, cy + 22);
            }
          }
          for (let i = 0; i < protons; i++) {
            const ang = (i / protons) * Math.PI * 2;
            const x = cx + Math.cos(ang) * 7;
            const y = cy + Math.sin(ang) * 7;
            ctx.beginPath();
            ctx.arc(x, y, 2.6, 0, Math.PI * 2);
            ctx.fillStyle = "#f87171";
            ctx.fill();
          }
          for (let i = 0; i < neutronCount; i++) {
            const ang = (i / neutronCount) * Math.PI * 2 + 0.4;
            const x = cx + Math.cos(ang) * 10;
            const y = cy + Math.sin(ang) * 10;
            ctx.beginPath();
            ctx.arc(x, y, 2.6, 0, Math.PI * 2);
            ctx.fillStyle = "#94a3b8";
            ctx.fill();
          }
          ctx.fillStyle = "#f8fafc";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${protons}p ${neutronCount}n`, cx - 30, cy + 34);
          ctx.fillStyle = "#e2e8f0";
          ctx.font = "bold 15px system-ui";
          ctx.fillText(`Element ${element} · mass ${mass}`, 30, 28);
          ctx.fillStyle = "#94a3b8";
          ctx.font = "12px system-ui";
          ctx.fillText(`shells ${shells.join("-")} · valence ${valence}e⁻`, 30, 46);
          ctx.fillStyle = "#a5b4fc";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(cfg, 30, 66);
          ctx.fillStyle = noble ? "#4ade80" : "#fda4af";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(
            noble ? "full outer shell — noble-gas stable" : valence >= 5 ? "few electrons short of a full shell — wants to gain" : "few outer electrons — likely to lose them",
            30,
            84,
          );
        }}
      />
      <div className="mt-4">
        <Slider label="Atomic number (protons)" value={element} min={1} max={20} step={1} hex={a} accent={at} onChange={setElement} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Shell labels" checked={showLabels} onChange={setShowLabels} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Protons" value={`${protons}`} accent={at} />
        <Stat label="Neutrons" value={`${neutronCount}`} accent={at} />
        <Stat label="Valence e⁻" value={`${valence}`} accent={at} />
        <Stat label="Config" value={cfg} accent={at} />
      </div>
    </SimShell>
  );
}

export function RedoxSim({ topic }: { topic?: string }) {
  const a = "#14b8a6";
  const at = "text-teal-600 dark:text-teal-400";
  const [metalA, setMetalA] = useState("Zn");
  const [metalB, setMetalB] = useState("Cu");
  const [showArrows, setShowArrows] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const series = ["K", "Na", "Ca", "Mg", "Zn", "Fe", "Pb", "Cu", "Ag"];
  const stdRed: Record<string, number> = {
    K: -2.93,
    Na: -2.71,
    Ca: -2.87,
    Mg: -2.37,
    Zn: -0.76,
    Fe: -0.44,
    Pb: -0.13,
    Cu: 0.34,
    Ag: 0.8,
  };
  const eA = stdRed[metalA];
  const eB = stdRed[metalB];
  const aReduces = eA < eB;
  const active = aReduces ? metalA : metalB;
  const inactive = aReduces ? metalB : metalA;
  const eCell = Math.abs(eA - eB);
  const ePos = (sim.tick % 100) / 100;
  const ex = aReduces ? 150 : 490;
  const ex2 = aReduces ? 490 : 150;
  return (
    <SimShell
      icon="🔁"
      title={simTitle(topic, "Oxidation & reduction")}
      accent="teal"
      subtitle={`${topic ?? "Redox reactions"} — oxidation is loss of electrons, reduction is gain. The more reactive metal loses electrons and reduces the other's ions.`}
      hint="OIL RIG: Oxidation Is Loss, Reduction Is Gain. Zinc is more reactive than copper, so it displaces copper from its salt solution."
      controls={<SimChip accent="teal"><span aria-hidden>🔁</span>{topic ?? "redox"}</SimChip>}
    >
      <SimCanvas
        deps={[metalA, metalB, aReduces, active, inactive, ePos, showArrows, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const beaker = (x: number, label: string, metal: string, ionColor: string) => {
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, 60, 160, 170);
            ctx.fillStyle = ionColor;
            ctx.fillRect(x, 60, 160, 170);
            ctx.fillStyle = "#334155";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(`${label}`, x + 40, 90);
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(x + 40, 170, 80, 60);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px system-ui";
            ctx.fillText(metal, x + 56, 205);
          };
          beaker(60, `${metalA}⁺ ions`, metalA, "#99f6e4");
          beaker(420, `${metalB}⁺ ions`, metalB, "#c4b5fd");
          if (showArrows) {
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(ex, 120);
            ctx.lineTo(ex2, 120);
            ctx.moveTo(ex2, 120);
            ctx.lineTo(ex2 - (ex2 > ex ? 14 : -14), 108);
            ctx.moveTo(ex2, 120);
            ctx.lineTo(ex2 - (ex2 > ex ? 14 : -14), 132);
            ctx.stroke();
            ctx.fillStyle = "#b45309";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("e⁻", (ex + ex2) / 2 - 8, 112);
          }
          ctx.fillStyle = "#134e4a";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${active} → ${active}²⁺ + 2e⁻ (oxidation)  E°(red) = ${stdRed[active].toFixed(2)} V`, 30, 30);
          ctx.fillText(`${inactive}²⁺ + 2e⁻ → ${inactive} (reduction)  E°(red) = ${stdRed[inactive].toFixed(2)} V`, 30, 48);
          ctx.fillStyle = "#0f766e";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(
            aReduces ? `${metalA} displaces ${metalB} — E°cell = ${eCell.toFixed(2)} V` : `${metalB} displaces ${metalA} — E°cell = ${eCell.toFixed(2)} V`,
            30,
            68,
          );
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Metal A</span>
          <select value={metalA} onChange={(e) => setMetalA(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {series.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Metal B</span>
          <select value={metalB} onChange={(e) => setMetalB(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {series.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Electron arrow" checked={showArrows} onChange={setShowArrows} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Anode (oxidised)" value={active} accent={at} />
        <Stat label="Cathode (reduced)" value={inactive} accent={at} />
        <Stat label="E°cell" value={`${eCell.toFixed(2)} V`} accent={at} />
      </div>
    </SimShell>
  );
}

export function GalvanicSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const couples: Record<string, [string, string]> = {
    "Zn / Cu": ["Zn", "Cu"],
    "Mg / Cu": ["Mg", "Cu"],
    "Fe / Cu": ["Fe", "Cu"],
    "Zn / Ag": ["Zn", "Ag"],
  };
  const stdRed: Record<string, number> = { Zn: -0.76, Mg: -2.37, Fe: -0.44, Cu: 0.34, Ag: 0.8 };
  const charge: Record<string, number> = { Zn: 2, Mg: 2, Fe: 2, Cu: 2, Ag: 1 };
  const [pair, setPair] = useState("Zn / Cu");
  const [loadOn, setLoadOn] = useState(true);
  const [concA, setConcA] = useState(0.1);
  const [concB, setConcB] = useState(0.1);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const [metalA, metalB] = couples[pair];
  const eRedA = stdRed[metalA] + (0.0592 / charge[metalA]) * Math.log10(concA);
  const eRedB = stdRed[metalB] + (0.0592 / charge[metalB]) * Math.log10(concB);
  const aIsAnode = eRedA < eRedB;
  const anode = aIsAnode ? metalA : metalB;
  const cathode = aIsAnode ? metalB : metalA;
  const emf = Math.abs(eRedB - eRedA);
  const flow = (sim.tick % 60) / 60;
  return (
    <SimShell
      icon="🔋"
      title={simTitle(topic, "Galvanic cell")}
      accent="amber"
      subtitle={`${topic ?? "Electrochemistry"} — chemical energy becomes electrical energy. Electrons flow from anode to cathode through the wire, while ions balance charge in the salt bridge.`}
      hint={`E⁰cell = ${Math.abs(stdRed[metalB] - stdRed[metalA]).toFixed(2)} V at 1 M; the Nernst equation E = E⁰ − (0.0592/n)·log Q lets concentration shift the voltage.`}
      controls={<SimChip accent="amber"><span aria-hidden>🔋</span>{topic ?? "galvanic cell"}</SimChip>}
    >
      <SimCanvas
        deps={[pair, metalA, metalB, eRedA, eRedB, anode, cathode, emf, loadOn, flow, concA, concB, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const beaker = (x: number, metal: string, ion: string, tag: string) => {
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, 70, 170, 160);
            ctx.fillStyle = "#fef3c7";
            ctx.fillRect(x, 70, 170, 160);
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x + 70, 150, 30, 80);
            ctx.fillStyle = "#92400e";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(metal, x + 66, 195);
            ctx.fillStyle = "#78350f";
            ctx.font = "11px system-ui";
            ctx.fillText(`${metal}²⁺ (${ion})`, x + 40, 90);
            ctx.fillStyle = tag === "anode" ? "#b91c1c" : "#047857";
            ctx.font = "bold 11px system-ui";
            ctx.fillText(`${tag} ${tag === "anode" ? "(−)" : "(+)"}`, x + 40, 108);
          };
          beaker(30, metalA, aIsAnode ? "anode" : "cathode", aIsAnode ? "anode" : "cathode");
          beaker(440, metalB, aIsAnode ? "cathode" : "anode", aIsAnode ? "cathode" : "anode");
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(214, 80, 12, 140);
          ctx.fillStyle = "#334155";
          ctx.font = "bold 10px system-ui";
          ctx.fillText("salt", 222, 140);
          ctx.fillText("bridge", 218, 152);
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(100, 70);
          ctx.lineTo(100, 40);
          ctx.lineTo(540, 40);
          ctx.lineTo(540, 70);
          ctx.stroke();
          if (loadOn) {
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(320, 40, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#78350f";
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("⚡", 313, 45);
            ctx.fillStyle = "#b45309";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`${emf.toFixed(2)} V`, 306, 26);
            const px = 100 + flow * 440;
            ctx.beginPath();
            ctx.arc(px, 30, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#fbbf24";
            ctx.fill();
          }
          ctx.fillStyle = "#78350f";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("e⁻ flow →", 150, 26);
          ctx.fillText("e⁻ flow →", 420, 26);
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(
            `${metalA}²⁺ ${concA.toFixed(2)} M → E = ${eRedA.toFixed(2)} V · ${metalB}²⁺ ${concB.toFixed(2)} M → E = ${eRedB.toFixed(2)} V`,
            30,
            h - 12,
          );
        }}
      />
      <div className="mt-4">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Electrode pair</span>
          <select value={pair} onChange={(e) => setPair(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {Object.keys(couples).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={`[${metalA}²⁺]`} value={concA} min={0.001} max={1} step={0.001} hex={a} accent={at} unit=" M" onChange={setConcA} />
        <Slider label={`[${metalB}²⁺]`} value={concB} min={0.001} max={1} step={0.001} hex={a} accent={at} unit=" M" onChange={setConcB} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Bulb (load)" checked={loadOn} onChange={setLoadOn} hex={a} hint="closes the circuit" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Cell voltage" value={`${emf.toFixed(2)} V`} accent={at} />
        <Stat label="Anode" value={`${anode} (−)`} accent={at} />
        <Stat label="Cathode" value={`${cathode} (+)`} accent={at} />
      </div>
    </SimShell>
  );
}

export function ElectrolysisSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const electrolytes = ["Water + H2SO4", "CuSO4 solution", "NaCl molten"];
  const F = 96485;
  const species: Record<number, { cat: { sym: string; z: number; m: number }; an: { sym: string; z: number; m: number } }> = {
    0: { cat: { sym: "H2", z: 2, m: 2.016 }, an: { sym: "O2", z: 4, m: 32.0 } },
    1: { cat: { sym: "Cu", z: 2, m: 63.55 }, an: { sym: "O2", z: 4, m: 32.0 } },
    2: { cat: { sym: "Na", z: 1, m: 22.99 }, an: { sym: "Cl2", z: 2, m: 70.9 } },
  };
  const [electrolyte, setElectrolyte] = useState(0);
  const [power, setPower] = useState(true);
  const [current, setCurrent] = useState(1);
  const [time, setTime] = useState(300);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const chargeQ = current * time;
  const catMol = chargeQ / (species[electrolyte].cat.z * F);
  const anMol = chargeQ / (species[electrolyte].an.z * F);
  const catMass = catMol * species[electrolyte].cat.m;
  const anMass = anMol * species[electrolyte].an.m;
  const catGas = species[electrolyte].cat.sym !== "Cu" && species[electrolyte].cat.sym !== "Na";
  const catAmount = catGas ? catMol * 22.4 : catMass;
  const anGas = species[electrolyte].an.sym !== "Cu" && species[electrolyte].an.sym !== "Na";
  const anAmount = anGas ? anMol * 22.4 : anMass;
  const { cat, an } = species[electrolyte];
  return (
    <SimShell
      icon="⚡"
      title={simTitle(topic, "Electrolysis cell")}
      accent="cyan"
      subtitle={`${topic ?? "Electrochemistry"} — electric current forces a chemical change. Positive ions go to the cathode (−), negative ions to the anode (+).`}
      hint={`Faraday's law: m = I·t·M/(z·F) with F = 96485 C/mol. ${chargeQ.toFixed(0)} C passed produces ${catMol.toExponential(1)} mol at the cathode.`}
      controls={<SimChip accent="cyan"><span aria-hidden>⚡</span>{topic ?? "electrolysis"}</SimChip>}
    >
      <SimCanvas
        deps={[electrolyte, cat, an, power, catMol, anMol, current, time, chargeQ, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#cffafe";
          ctx.fillRect(70, 50, 500, 180);
          ctx.strokeStyle = "#0e7490";
          ctx.lineWidth = 4;
          ctx.strokeRect(70, 50, 500, 180);
          ctx.fillStyle = "#155e75";
          ctx.fillRect(150, 70, 18, 150);
          ctx.fillStyle = "#334155";
          ctx.fillRect(470, 70, 18, 150);
          ctx.fillStyle = "#0e7490";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("cathode (−)", 120, 240);
          ctx.fillText("anode (+)", 470, 240);
          ctx.fillStyle = "#082f49";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(electrolytes[electrolyte], 300, 76);
          const state = sim.tick % 12;
          if (power) {
            ctx.fillStyle = "#155e75";
            for (let i = 0; i < 5; i++) {
              const x = 165 + ((i * 23 + state) % 60);
              const y = 220 - ((i * 29 + state * 3) % 120);
              ctx.beginPath();
              ctx.arc(x, y, 5 + (i % 2), 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = "#0e7490";
            for (let i = 0; i < 5; i++) {
              const x = 470 - 18 + 9 + ((i * 23 + state) % 60);
              const y = 220 - ((i * 31 + state * 3) % 120);
              ctx.beginPath();
              ctx.arc(x, y, 5 + (i % 2), 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = "#78350f";
            ctx.font = "bold 11px system-ui";
            ctx.fillText(`${cat.sym}↑`, 130, 66);
            ctx.fillText(`${an.sym}↑`, 480, 66);
          }
          ctx.fillStyle = "#082f49";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(
            power
              ? `current ON — Q = ${chargeQ.toFixed(0)} C, I = ${current.toFixed(1)} A for ${time}s`
              : "current OFF — no reaction",
            30,
            26,
          );
          ctx.fillStyle = "#155e75";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(
            `cathode: ${catAmount.toExponential(1)} ${catGas ? "L (STP)" : "g"} · anode: ${anAmount.toExponential(1)} ${anGas ? "L (STP)" : "g"}`,
            30,
            h - 12,
          );
        }}
      />
      <div className="mt-4">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Electrolyte</span>
          <select value={electrolyte} onChange={(e) => setElectrolyte(Number(e.target.value))} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {electrolytes.map((e, i) => (
              <option key={e} value={i}>{e}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Current" value={current} min={0.2} max={5} step={0.1} hex={a} accent={at} unit=" A" onChange={setCurrent} />
        <Slider label="Time" value={time} min={30} max={1200} step={30} hex={a} accent={at} unit=" s" onChange={setTime} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Power on" checked={power} onChange={setPower} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Charge passed" value={`${chargeQ.toFixed(0)} C`} accent={at} />
        <Stat label="At cathode" value={`${cat.sym} · ${catAmount.toFixed(3)} ${catGas ? "L" : "g"}`} accent={at} />
        <Stat label="At anode" value={`${an.sym} · ${anAmount.toFixed(3)} ${anGas ? "L" : "g"}`} accent={at} />
      </div>
    </SimShell>
  );
}

export function DisplacementSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [metal, setMetal] = useState("Zn");
  const [salt, setSalt] = useState("CuSO4");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const series: Record<string, number> = { Mg: 0, Zn: 1, Fe: 2, Pb: 3, Cu: 4 };
  const salts: Record<string, string> = { CuSO4: "Cu", FeSO4: "Fe", ZnSO4: "Zn", AgNO3: "Ag" };
  const reacts = series[metal] < series[salts[salt]];
  const progress = Math.min(1, sim.tick / 50);
  const displaced = reacts && progress >= 0.4;
  return (
    <SimShell
      icon="⬇️"
      title={simTitle(topic, "Displacement reactions")}
      accent="violet"
      subtitle={`${topic ?? "Chemical reactivity"} — a more reactive metal displaces a less reactive one from its salt solution, because it reduces its ions.`}
      hint="Reactivity series: Mg > Zn > Fe > Pb > Cu. Zinc placed in copper sulphate turns the blue solution lighter and coats itself in copper."
      controls={<SimChip accent="violet"><span aria-hidden>⬇️</span>{topic ?? "displacement"}</SimChip>}
    >
      <SimCanvas
        deps={[metal, salt, reacts, displaced, progress, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.strokeRect(90, 60, 220, 170);
          const blue = reacts ? (0.75 - progress * 0.5) : 0.8;
          ctx.fillStyle = reacts && displaced ? "rgba(250,250,250,0.85)" : `rgba(96,165,250,${blue})`;
          ctx.fillRect(90, 60, 220, 170);
          if (progress < 0.4 || !reacts) {
            ctx.fillStyle = "#475569";
            ctx.fillRect(180, 160, 40, 70);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(metal, 186, 195);
          } else if (displaced) {
            ctx.fillStyle = "#b45309";
            ctx.fillRect(180, 140, 40, 90);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(metal, 186, 185);
            ctx.fillStyle = "#78350f";
            ctx.font = "bold 11px system-ui";
            ctx.fillText(`${salts[salt]} coating`, 120, 50);
          }
          ctx.fillStyle = "#4c1d95";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${salt} solution`, 130, 30);
          ctx.fillStyle = "#6d28d9";
          ctx.font = "12px system-ui";
          ctx.fillText(`${metal} (s) + ${salt} (aq) → ${salts[salt]} (s) + ${metal}${salt.includes("SO4") ? "SO4" : "NO3"} (aq)`, 30, h - 20);
          ctx.fillStyle = reacts ? "#047857" : "#b91c1c";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(reacts ? `REACTS — ${metal} displaces ${salts[salt]}` : `no reaction — ${metal} is less reactive than ${salts[salt]}`, 30, 30);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Metal</span>
          <select value={metal} onChange={(e) => setMetal(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {Object.keys(series).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Salt solution</span>
          <select value={salt} onChange={(e) => setSalt(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {Object.keys(salts).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Metal" value={metal} accent={at} />
        <Stat label="Displaces" value={reacts ? salts[salt] : "nothing"} accent={reacts ? at : "text-rose-600 dark:text-rose-400"} />
        <Stat label="Evidence" value={reacts ? "colour change + deposit" : "no change"} accent={at} />
      </div>
    </SimShell>
  );
}

export function PhSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [ph, setPh] = useState(7);
  const [showIons, setShowIons] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const hPlus = Math.pow(10, -ph);
  const ohMinus = 1e-14 / hPlus;
  const pOH = 14 - ph;
  const color = ph < 3 ? "#dc2626" : ph < 5 ? "#f97316" : ph < 6.5 ? "#eab308" : ph <= 7.5 ? "#22c55e" : ph < 9 ? "#0ea5e9" : ph < 11 ? "#6366f1" : "#8b5cf6";
  const hCount = Math.max(1, Math.round(30 * Math.pow(10, -ph) * 1e4));
  const ohCount = Math.max(1, Math.round(30 * ohMinus * 1e4));
  const acid = ph < 7;
  const base = ph > 7;
  const presets: [string, number][] = [
    ["battery acid", 0],
    ["lemon juice", 2.2],
    ["vinegar", 3],
    ["coffee", 5],
    ["pure water", 7],
    ["seawater", 8.2],
    ["soap", 10],
    ["bleach", 12.5],
  ];
  const kw = hPlus * ohMinus;
  return (
    <SimShell
      icon="🧫"
      title={simTitle(topic, "pH scale — acids & bases")}
      accent="cyan"
      subtitle={`${topic ?? "Acids, bases & salts"} — pH measures H⁺ concentration. pH < 7 is acidic, 7 neutral, > 7 basic. Every pH unit is a ×10 change.`}
      hint="Universal indicator turns red in acid and purple in alkali. Lower pH means more H⁺ ions — pH = −log10[H⁺]."
      controls={<SimChip accent="cyan"><span aria-hidden>🧫</span>{topic ?? "acids and bases"}</SimChip>}
    >
      <SimCanvas
        deps={[ph, hCount, ohCount, color, showIons, acid, base, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = color;
          ctx.fillRect(70, 60, 220, 160);
          ctx.strokeStyle = "#0e7490";
          ctx.lineWidth = 3;
          ctx.strokeRect(70, 60, 220, 160);
          ctx.save();
          ctx.beginPath();
          ctx.rect(70, 60, 220, 160);
          ctx.clip();
          if (showIons) {
            for (let i = 0; i < Math.min(45, hCount); i++) {
              const x = 80 + ((i * 41 + sim.tick) % 200);
              const y = 70 + ((i * 73 + sim.tick) % 140);
              ctx.fillStyle = "#ef4444";
              ctx.font = "bold 11px system-ui";
              ctx.fillText("H⁺", x, y);
            }
            for (let i = 0; i < Math.min(45, ohCount); i++) {
              const x = 80 + ((i * 53 + sim.tick) % 200);
              const y = 70 + ((i * 91 + sim.tick) % 140);
              ctx.fillStyle = "#0284c7";
              ctx.font = "bold 11px system-ui";
              ctx.fillText("OH⁻", x, y);
            }
          }
          ctx.restore();
          ctx.fillStyle = "#0e7490";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(acid ? "acidic" : base ? "alkaline" : "neutral", 70, 46);
          const gx = 350;
          const strip = ctx.createLinearGradient(gx, 0, w - 30, 0);
          strip.addColorStop(0, "#dc2626");
          strip.addColorStop(0.21, "#f97316");
          strip.addColorStop(0.43, "#eab308");
          strip.addColorStop(0.5, "#22c55e");
          strip.addColorStop(0.57, "#14b8a6");
          strip.addColorStop(0.79, "#6366f1");
          strip.addColorStop(1, "#8b5cf6");
          ctx.fillStyle = strip;
          ctx.fillRect(gx, h - 40, w - 30 - gx, 3);
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx, h - 40);
          ctx.lineTo(w - 30, h - 40);
          ctx.moveTo(gx, h - 40);
          ctx.lineTo(gx, 30);
          ctx.stroke();
          for (let p = 0; p <= 14; p++) {
            const x = gx + (p / 14) * (w - 60 - gx);
            ctx.fillStyle = "#64748b";
            ctx.font = "10px system-ui";
            ctx.fillText(`${p}`, x - 3, h - 22);
            ctx.strokeStyle = "rgba(148,163,184,0.3)";
            ctx.beginPath();
            ctx.moveTo(x, h - 40);
            ctx.lineTo(x, h - 34);
            ctx.stroke();
          }
          const px = gx + (ph / 14) * (w - 60 - gx);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(px - 9, h - 40);
          ctx.lineTo(px + 9, h - 40);
          ctx.lineTo(px, h - 52);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#0e7490";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`[H⁺] = ${hPlus.toExponential(1)} M`, 30, h - 20);
        }}
      />
      <div className="mt-4">
        <Slider label="pH value" value={ph} min={0} max={14} step={0.1} hex={a} accent={at} onChange={setPh} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show ions" checked={showIons} onChange={setShowIons} hex={a} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {presets.map(([label, value]) => (
          <ActionButton key={label} label={label} hex={a} onClick={() => setPh(value)} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="pH" value={`${ph.toFixed(1)}`} accent={at} />
        <Stat label="[H⁺]" value={`${hPlus.toExponential(1)} M`} accent={at} />
        <Stat label="pOH" value={`${pOH.toFixed(1)}`} accent={at} />
        <Stat label="Kw = [H⁺][OH⁻]" value={kw.toExponential(0)} accent={at} />
      </div>
      <div className="mt-3">
        <Stat label="Nature" value={acid ? "acidic" : base ? "alkaline" : "neutral"} accent={acid ? "text-rose-600 dark:text-rose-400" : base ? "text-violet-600 dark:text-violet-400" : "text-emerald-600 dark:text-emerald-400"} />
      </div>
    </SimShell>
  );
}

export function ChromatographySim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const inks = ["Leaf extract", "Felt-tip pen", "Ink mixture"];
  const [ink, setInk] = useState(1);
  const [run, setRun] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const solventY = 170 - Math.min(1, sim.tick / 40) * 130;
  const spots: Record<number, [string, number][]> = {
    0: [["chlorophyll", 0.85], ["carotene", 0.35]],
    1: [["blue", 0.6], ["red", 0.9]],
    2: [["blue", 0.55], ["red", 0.85], ["yellow", 0.3]],
  };
  const spotColors: Record<string, string> = { chlorophyll: "#16a34a", carotene: "#f97316", blue: "#3b82f6", red: "#ef4444", yellow: "#eab308" };
  const done = sim.tick >= 40;
  return (
    <SimShell
      icon="🎨"
      title={simTitle(topic, "Paper chromatography")}
      accent="violet"
      subtitle={`${topic ?? "Separation techniques"} — different pigments travel at different speeds up the paper, so they separate into bands.`}
      hint="The distance each spot travels divided by the solvent distance is its Rf value. Compare Rf values to identify substances."
      controls={<SimChip accent="violet"><span aria-hidden>🎨</span>{topic ?? "chromatography"}</SimChip>}
    >
      <SimCanvas
        deps={[ink, run, solventY, done, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(90, 30, 160, 200);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.strokeRect(90, 30, 160, 200);
          ctx.fillStyle = "#0ea5e9";
          ctx.fillRect(90, solventY, 160, 200 - solventY + 30);
          const doneFactor = Math.min(1, sim.tick / 40);
          for (const [name, rf] of spots[ink]) {
            const travel = rf * 120 * doneFactor;
            const x = 130 + (spots[ink].indexOf([name, rf]) - (spots[ink].length - 1) / 2) * 30;
            ctx.fillStyle = spotColors[name];
            ctx.beginPath();
            ctx.arc(x, solventY + 30 - 40 + 6 - travel, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#4c1d95";
            ctx.font = "10px system-ui";
            ctx.fillText(name, x - 20, solventY + 60 - travel - 6);
          }
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("solvent front", 100, solventY - 6);
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(done ? "separation complete" : "solvent rising…", 280, 60);
          ctx.fillStyle = "#334155";
          ctx.font = "12px system-ui";
          ctx.fillText(done ? "each pigment has its own Rf" : "spots climb the paper", 280, 78);
        }}
      />
      <div className="mt-4">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Sample</span>
          <select value={ink} onChange={(e) => setInk(Number(e.target.value))} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {inks.map((i, k) => (
              <option key={i} value={k}>{i}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Run solvent" checked={run} onChange={setRun} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Stationary" value="paper" accent={at} />
        <Stat label="Mobile phase" value="solvent" accent={at} />
        <Stat label="Separated" value={`${spots[ink].length} pigments`} accent={at} />
      </div>
    </SimShell>
  );
}

export function DistillationSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [temp, setTemp] = useState(35);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const boiling = temp >= 78;
  const vapor = (sim.tick % 12) / 12;
  const collected = boiling ? (sim.tick * 2) % 100 : 0;
  return (
    <SimShell
      icon="🥃"
      title={simTitle(topic, "Distillation")}
      accent="sky"
      subtitle={`${topic ?? "Separation techniques"} — heat a mixture until one liquid boils; its vapour condenses in the condenser and collects as pure liquid.`}
      hint="Ethanol boils at 78 °C, water at 100 °C — so heating an ethanol-water mixture to 78 °C and condensing the vapour separates them."
      controls={<SimChip accent="sky"><span aria-hidden>🥃</span>{topic ?? "distillation"}</SimChip>}
    >
      <SimCanvas
        deps={[temp, boiling, vapor, collected, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#bae6fd";
          ctx.fillRect(40, 130, 120, 80);
          ctx.strokeStyle = "#0c4a6e";
          ctx.lineWidth = 3;
          ctx.strokeRect(40, 130, 120, 80);
          ctx.fillStyle = "#e0f2fe";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("mixture", 70, 165);
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.moveTo(80, 212);
          ctx.lineTo(120, 230);
          ctx.lineTo(80, 248);
          ctx.lineTo(40, 230);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = boiling ? "#fbbf24" : "#fb923c";
          ctx.beginPath();
          ctx.arc(80, 226, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(160, 130);
          ctx.lineTo(160, 100);
          ctx.lineTo(260, 100);
          ctx.stroke();
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("vapour", 200, 92);
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 3;
          ctx.strokeRect(260, 40, 190, 60);
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(260, 40, 190, 60);
          ctx.fillStyle = "#334155";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("condenser", 300, 70);
          ctx.strokeStyle = "#0ea5e9";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(450, 70);
          ctx.lineTo(520, 70);
          ctx.lineTo(520, 190);
          ctx.stroke();
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(470, 190, 100, 30);
          ctx.strokeStyle = "#0c4a6e";
          ctx.strokeRect(470, 190, 100, 30);
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`${collected.toFixed(0)}%`, 490, 210);
          ctx.fillStyle = "#0369a1";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("collect", 500, 185);
          if (boiling) {
            ctx.fillStyle = "#bae6fd";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`✓ collected ${collected.toFixed(0)}%`, 470, 240);
          } else {
            ctx.fillStyle = "#334155";
            ctx.font = "12px system-ui";
            ctx.fillText("below boiling point —", 470, 236);
            ctx.fillText("no vapour yet", 470, 252);
          }
        }}
      />
      <div className="mt-4">
        <Slider label="Heat temperature" value={temp} min={30} max={100} step={1} hex={a} accent={at} unit="°C" onChange={setTemp} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Boiling point" value="78 °C (ethanol)" accent={at} />
        <Stat label="Heater" value={temp >= 78 ? "boiling" : "warm"} accent={boiling ? "text-emerald-600 dark:text-emerald-400" : at} />
        <Stat label="Collected" value={`${collected.toFixed(0)}%`} accent={at} />
      </div>
    </SimShell>
  );
}

export function TitrationSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [acid, setAcid] = useState(25);
  const [ma, setMa] = useState(0.1);
  const [base, setBase] = useState(0.1);
  const [drip, setDrip] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 20 * speedMul });
  const equiv = (ma * acid) / base;
  const maxAdd = Math.max(60, equiv * 1.2);
  const added = drip ? Math.min(maxAdd, sim.tick * 0.6) : 0;
  const nAcid = (ma * acid) / 1000;
  const nBase = (base * added) / 1000;
  const pHAt = (v: number): number => {
    const nH = (ma * acid) / 1000;
    const nOH = (base * v) / 1000;
    const Vt = (acid + v) / 1000;
    if (nOH <= 0) return Math.min(6.99, Math.max(0, -Math.log10(ma)));
    if (nOH < nH) return Math.min(6.99, Math.max(0, -Math.log10((nH - nOH) / Vt)));
    if (nOH === nH) return 7;
    return Math.max(7.01, Math.min(14, 14 + Math.log10((nOH - nH) / Vt)));
  };
  const clamped = pHAt(added);
  const pink = clamped >= 8.2;
  const color = pink ? "#fda4af" : "rgba(254,240,138,0.5)";
  return (
    <SimShell
      icon="🧪"
      title={simTitle(topic, "Acid-base titration")}
      accent="rose"
      subtitle={`${topic ?? "Acids, bases & salts"} — base is added drop by drop to acid with an indicator. At the equivalence point n(HCl) = n(NaOH): MₐVₐ = MᵦVᵦ.`}
      hint={`Equivalence at ${equiv.toFixed(1)} mL of ${base.toFixed(2)} M NaOH (needs ${nAcid.toExponential(1)} mol). Phenolphthalein turns pink at pH ≈ 8.2 — the end point.`}
      controls={<SimChip accent="rose"><span aria-hidden>🧪</span>{topic ?? "titration"}</SimChip>}
    >
      <SimCanvas
        deps={[acid, ma, base, added, clamped, pink, color, equiv, maxAdd, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(60, 30, 26, 190);
          ctx.strokeStyle = "#64748b";
          ctx.strokeRect(60, 30, 26, 190);
          ctx.fillStyle = "#fda4af";
          ctx.fillRect(62, 30, 22, 190 * Math.max(0, 1 - added / maxAdd));
          ctx.fillStyle = "#64748b";
          ctx.font = "11px system-ui";
          ctx.fillText(`−${Math.max(0, maxAdd - added).toFixed(0)} mL`, 26, 40 + added * 1.2);
          ctx.fillStyle = color;
          ctx.fillRect(140, 120, 180, 90);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.strokeRect(140, 120, 180, 90);
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`${ma.toFixed(2)} M HCl ${acid} mL + ${base.toFixed(2)} M NaOH ${added.toFixed(1)} mL`, 150, 140);
          ctx.fillStyle = pink ? "#be123c" : "#78350f";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(pink ? "PINK — end point!" : "colourless", 150, 190);
          ctx.strokeStyle = "#94a3b8";
          ctx.beginPath();
          ctx.moveTo(360, h - 40);
          ctx.lineTo(w - 30, h - 40);
          ctx.moveTo(360, h - 40);
          ctx.lineTo(360, 40);
          ctx.stroke();
          for (let i = 0; i <= 14; i++) {
            const y = h - 40 - (i / 14) * 180;
            ctx.fillStyle = "#64748b";
            ctx.font = "10px system-ui";
            ctx.fillText(`${i}`, 364, y + 3);
            ctx.strokeStyle = "rgba(148,163,184,0.3)";
            ctx.beginPath();
            ctx.moveTo(378, y);
            ctx.lineTo(w - 30, y);
            ctx.stroke();
          }
          const X = (v: number) => 360 + (v / maxAdd) * (w - 390 - 360);
          const Y = (p: number) => h - 40 - (p / 14) * 180;
          ctx.strokeStyle = "#64748b";
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(X(equiv), h - 40);
          ctx.lineTo(X(equiv), 40);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#64748b";
          ctx.font = "10px system-ui";
          ctx.fillText(`eq ${equiv.toFixed(0)}`, X(equiv) + 4, 46);
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let i = 0; i <= 200; i++) {
            const v = (i / 200) * maxAdd;
            const p = pHAt(v);
            if (i === 0) ctx.moveTo(X(v), Y(p));
            else ctx.lineTo(X(v), Y(p));
          }
          ctx.stroke();
          const px = X(added);
          const py = Y(clamped);
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#9f1239";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`pH ${clamped.toFixed(1)}`, px + 10, py + 4);
          ctx.fillStyle = "#9f1239";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("pH vs base added (mL)", 360, 26);
          ctx.fillStyle = "#be123c";
          ctx.font = "11px system-ui";
          ctx.fillText(
            added < equiv ? `${nBase.toExponential(1)} mol OH⁻ < ${nAcid.toExponential(1)} mol H⁺` : added >= equiv ? `${nBase.toExponential(1)} mol OH⁻ ≥ ${nAcid.toExponential(1)} mol H⁺` : "waiting for base…",
            30,
            h - 12,
          );
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Acid volume" value={acid} min={10} max={40} step={1} hex={a} accent={at} unit=" mL" onChange={setAcid} />
        <Slider label="Acid conc." value={ma} min={0.1} max={0.5} step={0.05} hex={a} accent={at} unit=" M" onChange={setMa} />
        <Slider label="Base strength" value={base} min={0.05} max={1} step={0.05} hex={a} accent={at} unit=" M" onChange={setBase} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Add base" checked={drip} onChange={setDrip} hex={a} hint="pauses the burette" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Base added" value={`${added.toFixed(1)} mL`} accent={at} />
        <Stat label="pH now" value={`${clamped.toFixed(1)}`} accent={at} />
        <Stat label="Equivalence" value={`${equiv.toFixed(1)} mL`} accent={at} />
        <Stat label="Indicator" value={pink ? "pink (end point)" : "colourless"} accent={pink ? "text-rose-600 dark:text-rose-400" : at} />
      </div>
    </SimShell>
  );
}

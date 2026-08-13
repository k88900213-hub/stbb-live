import type { SimKind } from "@/lib/content/types";
import { ForceSim } from "./ForceSim";
import { CircuitBuilder } from "./CircuitBuilder";
import { KinematicsSim } from "./KinematicsSim";
import { ProjectileSim } from "./ProjectileSim";
import { GravitySim } from "./GravitySim";
import { WavesSim, SoundSim } from "./WavesLab";
import { OpticsSim } from "./OpticsSim";
import { ElectrostaticsSim, ElectromagnetismSim } from "./ElectrostaticsSim";
import {
  PeriodicTableSim,
  BondingSim,
  SolutionSim,
  ReactionSim,
  AtomSim,
  RedoxSim,
  GalvanicSim,
  ElectrolysisSim,
  DisplacementSim,
  PhSim,
  ChromatographySim,
} from "./ChemistryLabs";
import {
  CellSim,
  PhotosynthesisSim,
  RespirationSim,
  GeneticsSim,
  BiomoleculesSim,
  MicroscopeSim,
  OsmosisSim,
  MitosisSim,
  MeiosisSim,
  EnzymeSim,
  LocomotionSim,
  DigestionSim,
  CirculationSim,
  KidneySim,
  FoodWebSim,
  FermentationSim,
  ReproductionSim,
  ClassificationSim,
  GasExchangeSim,
  NervousSim,
} from "./BiologyLabs";
import {
  MomentsSim,
  EnergySim,
  SpecificHeatSim,
  LatentHeatSim,
  RadiationSim,
  MirrorSim,
  NuclearSim,
  FluidsSim,
  RefractionSim,
  TransformerSim,
  LogicGatesSim,
  ThermalExpansionSim,
  HeatTransferSim,
} from "./PhysicsLabs";
import { DistillationSim, TitrationSim } from "./ChemistryLabs";
import { MomentumSim } from "./MomentumSim";
import { HookesLawSim } from "./HookesLawSim";
import { PendulumSim } from "./PendulumSim";
import { FrictionSim } from "./FrictionSim";
import { GasLawsSim } from "./GasLawsSim";
import { RateOfReactionSim } from "./RateOfReactionSim";
import { NaturalSelectionSim } from "./NaturalSelectionSim";
import { PlantTransportSim } from "./PlantTransportSim";
import {
  PowerSim,
  PressureSim,
  ConvectionSim,
  EchoSim,
  ResonanceSim,
  DopplerSim,
  CapacitorSim,
  GeneratorSim,
  PhotoelectricSim,
  CircularMotionSim,
} from "./PhysicsLabs2";
import {
  CentreOfGravitySim,
  PulleySim,
  ViscositySim,
  SurfaceTensionSim,
  CalorimetrySim,
  ThermalEquilibriumSim,
  EarthMagnetSim,
  AcDcSim,
  TelescopeSim,
  FissionSim,
  FusionSim,
} from "./PhysicsLabs3";
import {
  DiffusionSim,
  CrystallizationSim,
  AlloysSim,
  CorrosionSim,
  ElectroplatingSim,
  StoichiometrySim,
  AlkanesSim,
  AlkenesSim,
  PolymersSim,
  SoapSim,
  CombustionSim,
  GreenhouseSim,
} from "./ChemistryLabs2";
import {
  OrganelleSim,
  DnaSim,
  ProteinSynthesisSim,
  ImmuneSim,
  HormoneSim,
  EarSim,
  PollinationSim,
  GerminationSim,
  NitrogenCycleSim,
  WaterCycleSim,
  ActiveTransportSim,
  VitaminsSim,
} from "./BiologyLabs2";
import { NewtonsThirdLawSim } from "./NewtonsThirdLawSim";
import { StandingWavesSim } from "./StandingWavesSim";
import { BloodGroupsSim } from "./BloodGroupsSim";
import { ElectromagneticSpectrumSim } from "./ElectromagneticSpectrumSim";
import { EquilibriumSim } from "./EquilibriumSim";
import { ColligativePropertiesSim } from "./ColligativePropertiesSim";
import { OrganicStructuresSim } from "./OrganicStructuresSim";
import { CarnotEngineSim } from "./CarnotEngineSim";

export const SIM_LABELS: Record<SimKind, string> = {
  circuit: "Circuit Lab",
  forces: "Force Simulator",
  kinematics: "Kinematics — motion graphs",
  projectile: "Projectile motion",
  gravitation: "Universal gravitation",
  waves: "Transverse wave",
  sound: "Sound — frequency & pitch",
  optics: "Convex lens — ray diagram",
  electrostatics: "Coulomb's law",
  electromagnetism: "Electromagnetism — solenoid",
  "periodic-table": "Interactive periodic table",
  bonding: "Chemical bonding",
  solutions: "Solutions & concentration",
  reactions: "Balancing chemical equations",
  cell: "Cell explorer",
  photosynthesis: "Photosynthesis factory",
  respiration: "Respiration — energy release",
  genetics: "Genetics — Punnett square",
  moments: "Moments & equilibrium",
  energy: "Energy conservation",
  "specific-heat": "Specific heat capacity",
  "latent-heat": "Latent heat & phase change",
  radiation: "Heat & electromagnetic radiation",
  mirror: "Concave mirror — ray diagram",
  atom: "Bohr model of the atom",
  redox: "Oxidation & reduction",
  galvanic: "Galvanic cell",
  electrolysis: "Electrolysis cell",
  displacement: "Displacement reactions",
  ph: "pH scale — acids & bases",
  chromatography: "Paper chromatography",
  biomolecules: "Biomolecules — molecules of life",
  microscope: "Compound microscope",
  osmosis: "Osmosis & cell water",
  mitosis: "Mitosis — cell cycle",
  meiosis: "Meiosis — gamete formation",
  enzyme: "Enzyme activity",
  locomotion: "Movement & locomotion",
  digestion: "Digestive system flow",
  circulation: "Heart & circulation",
  kidney: "Kidney & nephron",
  "food-web": "Food web & energy pyramid",
  fermentation: "Fermentation by yeast",
  reproduction: "Asexual reproduction",
  classification: "Classification tree",
  "gas-exchange": "Gaseous exchange",
  nervous: "Reflex arc & neuron",
  nuclear: "Nuclear physics lab",
  fluids: "Pressure & fluids lab",
  refraction: "Refraction of light",
  transformer: "The transformer",
  "logic-gates": "Logic gates",
  "thermal-expansion": "Thermal expansion",
  "heat-transfer": "Heat transfer",
  distillation: "Fractional distillation",
  titration: "Acid-base titration",
  momentum: "Momentum & collisions",
  "hookes-law": "Hooke's law — springs",
  pendulum: "Simple pendulum",
  friction: "Friction & inclined plane",
  "gas-laws": "Gas laws — Boyle, Charles",
  "rate-of-reaction": "Rate of reaction",
  "natural-selection": "Natural selection",
  "plant-transport": "Plant transport — xylem & phloem",
  power: "Power & work rate",
  pressure: "Pressure — force over area",
  convection: "Convection currents",
  echo: "Echo & sound reflection",
  resonance: "Resonance",
  doppler: "Doppler effect",
  capacitor: "Capacitor charge & discharge",
  "series-parallel": "Series & parallel circuits",
  motor: "DC electric motor",
  generator: "AC generator (dynamo)",
  photoelectric: "Photoelectric effect",
  "circular-motion": "Circular motion",
  "centre-of-gravity": "Centre of gravity & stability",
  pulley: "Pulleys & mechanical advantage",
  viscosity: "Viscosity & terminal velocity",
  "surface-tension": "Surface tension",
  calorimetry: "Calorimetry",
  "thermal-equilibrium": "Thermal equilibrium",
  "earth-magnet": "Earth's magnetic field",
  induction: "Electromagnetic induction",
  acdc: "AC vs DC current",
  telescope: "Refracting telescope",
  fission: "Nuclear fission",
  fusion: "Nuclear fusion",
  diffusion: "Diffusion of gases",
  crystallization: "Crystallization",
  alloys: "Alloys & alloying",
  corrosion: "Corrosion & rusting",
  electroplating: "Electroplating",
  stoichiometry: "Stoichiometry",
  alkanes: "Alkanes",
  alkenes: "Alkenes",
  polymers: "Polymers",
  soap: "Soaps & detergents",
  combustion: "Combustion of fuels",
  greenhouse: "Greenhouse effect",
  organelles: "Cell organelles",
  dna: "DNA structure",
  "protein-synthesis": "Protein synthesis",
  immune: "Immune response",
  hormones: "Hormones & feedback",
  ear: "The ear & hearing",
  pollination: "Pollination",
  germination: "Seed germination",
  "nitrogen-cycle": "Nitrogen cycle",
  "water-cycle": "Water cycle",
  "active-transport": "Active transport",
  vitamins: "Vitamins & minerals",
  "newtons-third-law": "Newton's third law — rocket recoil",
  "standing-waves": "Standing waves & harmonics",
  "blood-groups": "Blood groups & transfusion",
  "electromagnetic-spectrum": "Electromagnetic spectrum",
  equilibrium: "Chemical equilibrium & Le Chatelier",
  "colligative-properties": "Colligative properties",
  "organic-structures": "Organic molecule structures",
  "carnot-engine": "Carnot engine",
  "engine-cycles": "Engine cycles",
  "ion-exchange": "Ion exchange resin",
};

export function SimLab({ kind, topic }: { kind: SimKind; topic?: string }) {
  switch (kind) {
    case "circuit":
      return <CircuitBuilder topic={topic} />;
    case "forces":
      return <ForceSim topic={topic} />;
    case "kinematics":
      return <KinematicsSim topic={topic} />;
    case "projectile":
      return <ProjectileSim topic={topic} />;
    case "gravitation":
      return <GravitySim topic={topic} />;
    case "waves":
      return <WavesSim topic={topic} />;
    case "sound":
      return <SoundSim topic={topic} />;
    case "optics":
      return <OpticsSim topic={topic} />;
    case "electrostatics":
      return <ElectrostaticsSim topic={topic} />;
    case "electromagnetism":
      return <ElectromagnetismSim topic={topic} />;
    case "periodic-table":
      return <PeriodicTableSim topic={topic} />;
    case "bonding":
      return <BondingSim topic={topic} />;
    case "solutions":
      return <SolutionSim topic={topic} />;
    case "reactions":
      return <ReactionSim topic={topic} />;
    case "cell":
      return <CellSim topic={topic} />;
    case "photosynthesis":
      return <PhotosynthesisSim topic={topic} />;
    case "respiration":
      return <RespirationSim topic={topic} />;
    case "genetics":
      return <GeneticsSim topic={topic} />;
    case "moments":
      return <MomentsSim topic={topic} />;
    case "energy":
      return <EnergySim topic={topic} />;
    case "specific-heat":
      return <SpecificHeatSim topic={topic} />;
    case "latent-heat":
      return <LatentHeatSim topic={topic} />;
    case "radiation":
      return <RadiationSim topic={topic} />;
    case "mirror":
      return <MirrorSim topic={topic} />;
    case "atom":
      return <AtomSim topic={topic} />;
    case "redox":
      return <RedoxSim topic={topic} />;
    case "galvanic":
      return <GalvanicSim topic={topic} />;
    case "electrolysis":
      return <ElectrolysisSim topic={topic} />;
    case "displacement":
      return <DisplacementSim topic={topic} />;
    case "ph":
      return <PhSim topic={topic} />;
    case "chromatography":
      return <ChromatographySim topic={topic} />;
    case "biomolecules":
      return <BiomoleculesSim topic={topic} />;
    case "microscope":
      return <MicroscopeSim topic={topic} />;
    case "osmosis":
      return <OsmosisSim topic={topic} />;
    case "mitosis":
      return <MitosisSim topic={topic} />;
    case "meiosis":
      return <MeiosisSim topic={topic} />;
    case "enzyme":
      return <EnzymeSim topic={topic} />;
    case "locomotion":
      return <LocomotionSim topic={topic} />;
    case "digestion":
      return <DigestionSim topic={topic} />;
    case "circulation":
      return <CirculationSim topic={topic} />;
    case "kidney":
      return <KidneySim topic={topic} />;
    case "food-web":
      return <FoodWebSim topic={topic} />;
    case "fermentation":
      return <FermentationSim topic={topic} />;
    case "reproduction":
      return <ReproductionSim topic={topic} />;
    case "classification":
      return <ClassificationSim topic={topic} />;
    case "gas-exchange":
      return <GasExchangeSim topic={topic} />;
    case "nervous":
      return <NervousSim topic={topic} />;
    case "nuclear":
      return <NuclearSim topic={topic} />;
    case "fluids":
      return <FluidsSim topic={topic} />;
    case "refraction":
      return <RefractionSim topic={topic} />;
    case "transformer":
      return <TransformerSim topic={topic} />;
    case "logic-gates":
      return <LogicGatesSim topic={topic} />;
    case "thermal-expansion":
      return <ThermalExpansionSim topic={topic} />;
    case "heat-transfer":
      return <HeatTransferSim topic={topic} />;
    case "distillation":
      return <DistillationSim topic={topic} />;
    case "titration":
      return <TitrationSim topic={topic} />;
    case "momentum":
      return <MomentumSim topic={topic} />;
    case "hookes-law":
      return <HookesLawSim topic={topic} />;
    case "pendulum":
      return <PendulumSim topic={topic} />;
    case "friction":
      return <FrictionSim topic={topic} />;
    case "gas-laws":
      return <GasLawsSim topic={topic} />;
    case "rate-of-reaction":
      return <RateOfReactionSim topic={topic} />;
    case "natural-selection":
      return <NaturalSelectionSim topic={topic} />;
    case "plant-transport":
      return <PlantTransportSim topic={topic} />;
    case "power":
      return <PowerSim topic={topic} />;
    case "pressure":
      return <PressureSim topic={topic} />;
    case "convection":
      return <ConvectionSim topic={topic} />;
    case "echo":
      return <EchoSim topic={topic} />;
    case "resonance":
      return <ResonanceSim topic={topic} />;
    case "doppler":
      return <DopplerSim topic={topic} />;
    case "capacitor":
      return <CapacitorSim topic={topic} />;
    case "series-parallel":
      return <CircuitBuilder topic={topic} />;
    case "motor":
      return <ElectromagnetismSim topic={topic} />;
    case "generator":
      return <GeneratorSim topic={topic} />;
    case "photoelectric":
      return <PhotoelectricSim topic={topic} />;
    case "circular-motion":
      return <CircularMotionSim topic={topic} />;
    case "centre-of-gravity":
      return <CentreOfGravitySim topic={topic} />;
    case "pulley":
      return <PulleySim topic={topic} />;
    case "viscosity":
      return <ViscositySim topic={topic} />;
    case "surface-tension":
      return <SurfaceTensionSim topic={topic} />;
    case "calorimetry":
      return <CalorimetrySim topic={topic} />;
    case "thermal-equilibrium":
      return <ThermalEquilibriumSim topic={topic} />;
    case "earth-magnet":
      return <EarthMagnetSim topic={topic} />;
    case "induction":
      return <ElectromagnetismSim topic={topic} />;
    case "acdc":
      return <AcDcSim topic={topic} />;
    case "telescope":
      return <TelescopeSim topic={topic} />;
    case "fission":
      return <FissionSim topic={topic} />;
    case "fusion":
      return <FusionSim topic={topic} />;
    case "diffusion":
      return <DiffusionSim topic={topic} />;
    case "crystallization":
      return <CrystallizationSim topic={topic} />;
    case "alloys":
      return <AlloysSim topic={topic} />;
    case "corrosion":
      return <CorrosionSim topic={topic} />;
    case "electroplating":
      return <ElectroplatingSim topic={topic} />;
    case "stoichiometry":
      return <StoichiometrySim topic={topic} />;
    case "alkanes":
      return <AlkanesSim topic={topic} />;
    case "alkenes":
      return <AlkenesSim topic={topic} />;
    case "polymers":
      return <PolymersSim topic={topic} />;
    case "soap":
      return <SoapSim topic={topic} />;
    case "combustion":
      return <CombustionSim topic={topic} />;
    case "greenhouse":
      return <GreenhouseSim topic={topic} />;
    case "organelles":
      return <OrganelleSim topic={topic} />;
    case "dna":
      return <DnaSim topic={topic} />;
    case "protein-synthesis":
      return <ProteinSynthesisSim topic={topic} />;
    case "immune":
      return <ImmuneSim topic={topic} />;
    case "hormones":
      return <HormoneSim topic={topic} />;
    case "ear":
      return <EarSim topic={topic} />;
    case "pollination":
      return <PollinationSim topic={topic} />;
    case "germination":
      return <GerminationSim topic={topic} />;
    case "nitrogen-cycle":
      return <NitrogenCycleSim topic={topic} />;
    case "water-cycle":
      return <WaterCycleSim topic={topic} />;
    case "active-transport":
      return <ActiveTransportSim topic={topic} />;
    case "vitamins":
      return <VitaminsSim topic={topic} />;
    case "newtons-third-law":
      return <NewtonsThirdLawSim topic={topic} />;
    case "standing-waves":
      return <StandingWavesSim topic={topic} />;
    case "blood-groups":
      return <BloodGroupsSim topic={topic} />;
    case "electromagnetic-spectrum":
      return <ElectromagneticSpectrumSim topic={topic} />;
    case "equilibrium":
      return <EquilibriumSim topic={topic} />;
    case "colligative-properties":
      return <ColligativePropertiesSim topic={topic} />;
    case "organic-structures":
      return <OrganicStructuresSim topic={topic} />;
    case "carnot-engine":
      return <CarnotEngineSim topic={topic} />;
    case "engine-cycles":
      return <EquilibriumSim topic={topic} />;
    case "ion-exchange":
      return <EquilibriumSim topic={topic} />;
    default:
      return <CircuitBuilder topic={topic} />;
  }
}

// https://developers.google.com/maps/documentation/solar/calculate-costs-non-us
// https://developers.google.com/maps/documentation/solar/calculate-costs-typescript

export interface SolarPotentialData {
  maxArrayPanelsCount: number;
  maxArrayAreaMeters2: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetFactorKgPerMwh: number;
  panelCapacityWatts: number;
  panelHeightMeters: number;
  panelWidthMeters: number;
  panelLifetimeYears: number;
  solarPanelConfigs: {
    panelsCount: number;
    yearlyEnergyDcKwh: number;
  }[];
}

export interface SolarSavingsEstimate {
  yearlyEnergyDcKwh: number;
  yearlyEnergyCoverage: number;
  totalCostWithoutSolar: number;
  totalCostWithSolar: number;
  installationCost: number;
  yearsUntilBreakEven: number;
  lifetimeSavings: number;
}

// Installation assumptions (costs in EUR)
const ENERGY_COST_PER_KWH: number = 0.38; // €
const PANEL_CAPACITY_WATTS: number = 290;
const SOLAR_INCENTIVES: number = 0;
const COST_PER_KW_INSTALLED = 1557; // €
export const INSTALLATION_LIFETIME_YEARS = 25;

// Annual production and cost adjustments
const DC_TO_AC_DERATE = 0.85;
const EFFICIENCY_DEPRECIATION_FACTOR = 0.995;
export const ANNUAL_ENERGY_COST_MULTIPLIER = 1.015;
const DISCOUNT_RATE = 1.04;

export function estimateSolarSavings(
  potentialData: SolarPotentialData,
  panelsCount: number,
  monthlyAverageEnergyBill: number
): SolarSavingsEstimate | null {
  const selectedConfig = potentialData.solarPanelConfigs.find(
    (config) => config.panelsCount === panelsCount
  );
  if (!selectedConfig) {
    return null;
  }

  const yearlyEnergyDcKwh = selectedConfig.yearlyEnergyDcKwh;

  const totalCapacityKw = (panelsCount * PANEL_CAPACITY_WATTS) / 1000;
  const totalInstallationCost = totalCapacityKw * COST_PER_KW_INSTALLED;
  const installationCostPerWatt =
    totalInstallationCost / (totalCapacityKw * 1000);

  // Solar installation
  const installationSizeKw: number = (panelsCount * PANEL_CAPACITY_WATTS) / 1000;
  const installationCostTotal: number =
    installationCostPerWatt * installationSizeKw * 1000;

  // Energy consumption
  const monthlyKwhEnergyConsumption: number =
    monthlyAverageEnergyBill / ENERGY_COST_PER_KWH;
  const yearlyKwhEnergyConsumption: number = monthlyKwhEnergyConsumption * 12;

  // Energy produced for installation life span
  const initialAcKwhPerYear: number = yearlyEnergyDcKwh * DC_TO_AC_DERATE;
  const yearlyProductionAcKwh: number[] = Array(INSTALLATION_LIFETIME_YEARS)
    .fill(0)
    .map(
      (_, year) =>
        initialAcKwhPerYear * Math.pow(EFFICIENCY_DEPRECIATION_FACTOR, year)
    );

  // Cost with solar for installation life span
  const yearlyUtilityBillEstimates: number[] = yearlyProductionAcKwh.map(
    (yearlyKwhEnergyProduced, year) => {
      const billEnergyKwh =
        yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
      const billEstimate =
        (billEnergyKwh * ENERGY_COST_PER_KWH * ANNUAL_ENERGY_COST_MULTIPLIER ** year) /
        DISCOUNT_RATE ** year;
      return Math.max(billEstimate, 0); // bill cannot be negative
    }
  );
  const remainingLifetimeUtilityBill: number = yearlyUtilityBillEstimates.reduce(
    (x, y) => x + y,
    0
  );
  const totalCostWithSolar: number =
    installationCostTotal + remainingLifetimeUtilityBill - SOLAR_INCENTIVES;

  // Cost without solar for installation life span
  const yearlyCostWithoutSolar: number[] = Array(INSTALLATION_LIFETIME_YEARS)
    .fill(0)
    .map(
      (_, year) =>
        (monthlyAverageEnergyBill * 12 * Math.pow(ANNUAL_ENERGY_COST_MULTIPLIER, year)) /
        Math.pow(DISCOUNT_RATE, year)
    );

  const totalCostWithoutSolar: number = yearlyCostWithoutSolar.reduce(
    (x, y) => x + y,
    0
  );

  // Savings with solar for installation life span
  const savings: number = totalCostWithoutSolar - totalCostWithSolar;

  const yearlyEnergyCoverage: number =
    (yearlyEnergyDcKwh / yearlyKwhEnergyConsumption) * 100;

  // Calculate years until break-even
  let cumulativeSavings: number = 0;
  let yearsUntilBreakEven: number = INSTALLATION_LIFETIME_YEARS; // Default to lifespan if doesnt break even

  for (let year = 0; year < INSTALLATION_LIFETIME_YEARS; year++) {
    const yearlySavings =
        (monthlyAverageEnergyBill * 12 * Math.pow(ANNUAL_ENERGY_COST_MULTIPLIER, year)) /
        Math.pow(DISCOUNT_RATE, year) - yearlyUtilityBillEstimates[year];
    cumulativeSavings += yearlySavings;
    if (cumulativeSavings >= installationCostTotal) {
      yearsUntilBreakEven = year + 1; // Year index starts from 0
      break;
    }
  }

  return {
    yearlyEnergyDcKwh,
    yearlyEnergyCoverage,
    totalCostWithoutSolar,
    totalCostWithSolar,
    installationCost: installationCostTotal,
    yearsUntilBreakEven,
    lifetimeSavings: savings,
  };
}

export function findNeighboringPanelCounts(
  configs: SolarPotentialData["solarPanelConfigs"],
  panels: number
): { lower: number | null; higher: number | null } {
  const sortedConfigs = [...configs].sort(
    (a, b) => a.panelsCount - b.panelsCount
  );
  let lower = null;
  let higher = null;

  for (const config of sortedConfigs) {
    if (config.panelsCount < panels) {
      lower = config.panelsCount;
    } else if (config.panelsCount > panels) {
      higher = config.panelsCount;
      break;
    }
  }

  return { lower, higher };
}

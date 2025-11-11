import { FormData, CreditScore, EmploymentStatus } from './types';

export const SA_PRIME_RATE = 11.75;
export const DISPOSABLE_INCOME_BUFFER = 2500;
export const MAX_DTI_RATIO = 40;
export const WARN_DTI_RATIO = 36;
export const MAX_TCO_RATIO = 25;
export const WARN_TCO_RATIO = 22;

export const MIN_APPLICANT_AGE = 18;
export const MAX_APPLICANT_AGE = 65;
export const MAX_VEHICLE_AGE_AT_END = 12; // Vehicle cannot be older than 12 years at end of finance term
export const MIN_NON_PERMANENT_EMPLOYMENT_MONTHS = 24; // 2 years for self-employed/contract
export const LIVING_EXPENSE_PER_DEPENDENT = 1500; // Estimated monthly cost per dependent

export const INTEREST_RATE_MAP: Record<CreditScore, number | null> = {
    [CreditScore.EXCELLENT]: SA_PRIME_RATE - 0.5, // 11.25%
    [CreditScore.GOOD]: SA_PRIME_RATE + 0.5, // 12.25%
    [CreditScore.FAIR]: SA_PRIME_RATE + 2.5, // 14.25%
    [CreditScore.POOR]: null,
};

export const LOAN_TERMS = [12, 24, 36, 48, 60, 72];
export const BALLOON_PERCENTAGES = [0, 10, 20, 30];

export const INITIAL_FORM_DATA: FormData = {
    grossIncome: 30000,
    netIncome: 24000,
    freelanceIncomeMonth1: 0,
    freelanceIncomeMonth2: 0,
    freelanceIncomeMonth3: 0,
    employmentStatus: EmploymentStatus.PERMANENT,
    employmentLength: 24,
    applicantAge: 30,
    debtRepayments: 3000,
    rentMortgage: 6000,
    dependents: 0,
    creditScore: CreditScore.GOOD,
    adverseRecord: false,
    purchasePrice: 250000,
    vehicleYear: new Date().getFullYear() - 2,
    deposit: 25000,
    loanTerm: 72,
    balloonPercentage: 0,
    insurance: 1500,
    fuel: 2000,
    maintenance: 500,
};

export const INITIAL_CALCULATION_RESULT = {
    status: 'PENDING',
    maxLoanAmount: 0,
    monthlyInstallment: 0,
    totalMonthlyCost: 0,
    interestRate: 0,
    dtiRatio: 0,
    tcoRatio: 0,
    disposableIncome: 0,
    reasoning: [],
    warnings: [],
    maxInstallmentFromDTI: 0,
    maxInstallmentFromTCO: 0,
    maxInstallmentFromDI: 0,
    isCalculated: false,
};
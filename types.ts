export enum CreditScore {
    POOR = '<580',
    FAIR = '580-669',
    GOOD = '670-739',
    EXCELLENT = '740+',
}

export enum EmploymentStatus {
    PERMANENT = 'Permanent',
    CONTRACT = 'Contract',
    SELF_EMPLOYED = 'Self-employed',
}

export interface FormData {
    grossIncome: number;
    netIncome: number;
    freelanceIncomeMonth1: number;
    freelanceIncomeMonth2: number;
    freelanceIncomeMonth3: number;
    employmentStatus: EmploymentStatus;
    employmentLength: number;
    applicantAge: number;
    debtRepayments: number;
    rentMortgage: number;
    dependents: number;
    creditScore: CreditScore;
    adverseRecord: boolean;
    purchasePrice: number;
    vehicleYear: number;
    deposit: number;
    loanTerm: number;
    balloonPercentage: number;
    insurance: number;
    fuel: number;
    maintenance: number;
}

export enum AffordabilityStatus {
    PENDING = 'PENDING',
    NOT_APPROVED = 'Not Approved',
    APPROVED_WITH_CONDITIONS = 'Approved with Conditions',
    APPROVED = 'Approved',
}

export interface CheckResult {
    pass: boolean;
    message: string;
    value: string;
    limit: string;
}

export interface CalculationResult {
    status: AffordabilityStatus;
    maxLoanAmount: number;
    monthlyInstallment: number;
    totalMonthlyCost: number;
    interestRate: number;
    dtiRatio: number;
    tcoRatio: number;
    disposableIncome: number;
    reasoning: CheckResult[];
    warnings: string[];
    maxInstallmentFromDTI: number;
    maxInstallmentFromTCO: number;
    maxInstallmentFromDI: number;
    isCalculated: boolean;
}
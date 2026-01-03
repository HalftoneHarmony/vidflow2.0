/**
 * 💰 Finance Queries
 * 순수익 계산 및 재무 분석
 */

export type ProfitSummary = {
    totalRevenue: number;
    pgFees: number;
    fixedExpenses: number;
    laborCosts: number;
    netProfit: number;
};

export async function calculateNetProfit(eventId: number): Promise<ProfitSummary> {
    // TODO: Supabase 쿼리
    // 총 매출 - (PG 수수료 + 고정 지출 + 자동 인건비)

    return {
        totalRevenue: 0,
        pgFees: 0,
        fixedExpenses: 0,
        laborCosts: 0,
        netProfit: 0,
    };
}

export async function getPackageROI(packageId: number) {
    // TODO: 패키지별 판매량 대비 공정 소요 시간 및 수익률 분석
    return {
        salesCount: 0,
        avgProcessTime: 0,
        profitMargin: 0,
    };
}

import React, { Suspense } from "react";

import { CHART_FALLBACK_STYLE } from "components/stats/PieChartCard/chartStyles";
import type { PieChartDatum } from "components/stats/PieChartCard/PieChartCard";

const LazyPieChartCard = React.lazy(
    () => import("components/stats/PieChartCard/PieChartCard"),
);

interface LazyPieChartProps {
    data: PieChartDatum[];
    centerLabel: string;
}

export const LazyPieChart = ({ data, centerLabel }: LazyPieChartProps) => (
    <Suspense fallback={<div style={CHART_FALLBACK_STYLE} />}>
        <LazyPieChartCard data={data} centerLabel={centerLabel} />
    </Suspense>
);

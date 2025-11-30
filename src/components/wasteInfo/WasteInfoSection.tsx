'use client'
import { Card } from "antd";
import CollapsibleWasteInfo from "./CollapsibleWasteInfo";
import WasteInfoUpperCards from "./WasteInfoUpperCards";
import { PageContainer } from "@ant-design/pro-components";


const wasteManagementItems = [
    {
        title: "Solid Waste",
        description: "Any scrap material or other unwanted surplus substance or rejected products arising from the application of any process; and includes any substance required to be disposed of as being broken, worn out, contaminated or otherwise spoiled, but does not include scheduled waste, sewage or radioactive waste."
    },
    {
        title: "Waste Recycling",
        description: "Process of collecting, sorting, and processing materials that would otherwise be disposed of as waste, into new products or raw materials."
    },
    {
        title: "Waste Composting",
        description: "Biological decomposition of organic waste, such as food waste, garden waste, and animal manure, under controlled aerobic conditions to produce compost (organic fertilizer)."
    },
    {
        title: "Energy Recovery",
        description: "Conversion of waste materials into usable heat, electricity, or fuel through various processes such as incineration, gasification, pyrolysis, and anaerobic digestion."
    },
    {
        title: "Landfilling",
        description: "Final disposal method for solid waste by burying it in a designated and engineered landfill site that minimizes environmental and health risks."
    },
    {
        title: "Residual Waste",
        description: "Household solid waste and solid waste similar to household solid waste that is not reused, recycled or composted and may be placed in a container."
    },
    {
        title: "Recyclable Waste",
        description: "Household solid waste and solid waste similar to household solid waste that is separated for recycling, including paper, cardboard, glass, plastic, metal and food waste."
    },
    {
        title: "Bulky Waste",
        description: "Household solid waste and solid waste similar to household solid waste that is too large to be placed in a container, including appliances, furniture, tree trunks, branches and stumps."
    },
    {
        title: "Landscape Waste",
        description: "Refers to trees, leaves, creepers, grass, roots attached to the soil and other similar waste from gardens or premises."
    }
];

const WasteInfoSection = () => {
    return (
        <PageContainer title={'Waste Info'}>
            <Card>
                <WasteInfoUpperCards />
                <CollapsibleWasteInfo
                    items={wasteManagementItems}
                    defaultActiveKey={[1]}
                />
            </Card>
        </PageContainer>
    );
}

export default WasteInfoSection;
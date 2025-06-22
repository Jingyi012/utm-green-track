import CollapsibleWasteInfo from "./CollapsibleWasteInfo";
import WasteInfoUpperCards from "./WasteInfoUpperCards";


const wasteManagementItems = [
    {
        title: "Solid Waste",
        description: "Solid waste refers to everyday items discarded by the public, including household garbage, commercial waste, construction debris, and industrial by-products. Proper handling is essential to prevent pollution and health hazards."
    },
    {
        title: "Waste Recycling",
        description: "Recycling involves processing used materials into new products to reduce raw material consumption, save energy, and minimize environmental impact. Common recyclable materials include paper, plastic, metal, and glass."
    },
    {
        title: "Waste Composting",
        description: "Composting is the biological decomposition of organic waste—such as food scraps, garden waste, and manure—into nutrient-rich soil conditioner called compost. It reduces landfill usage and supports sustainable agriculture."
    },
    {
        title: "Energy Recovery",
        description: "Energy recovery involves converting non-recyclable waste materials into usable energy through processes like incineration, gasification, or pyrolysis. It helps reduce waste volume while generating electricity or heat."
    },
    {
        title: "Landfilling",
        description: "Landfilling is the process of disposing of waste materials in a controlled manner on land known as landfill."
    }
];

const WasteInfoSection = () => {
    return (
        <div style={{ padding: '24px' }}>
            <WasteInfoUpperCards />
            <CollapsibleWasteInfo
                items={wasteManagementItems}
                defaultActiveKey={[1]}
            />
        </div>
    );
}

export default WasteInfoSection;
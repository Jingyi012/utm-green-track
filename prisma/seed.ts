import { Campus } from '@/lib/enum/campus';
import { DisposalMethod } from '@/lib/enum/disposalMethod';
import { RecordLocation } from '@/lib/enum/location';
import { WasteRecordStatus } from '@/lib/enum/wasteRecordStatus';
import { WasteType } from '@/lib/enum/wasteType';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const disposalTypeMap: Record<DisposalMethod, WasteType[]> = {
    [DisposalMethod.Landfilling]: [WasteType.GeneralWaste, WasteType.BulkWaste, WasteType.RecyclableItem],
    [DisposalMethod.Recycling]: [
        WasteType.Paper,
        WasteType.Plastic,
        WasteType.Metal,
        WasteType.Rubber,
        WasteType.Ewaste,
        WasteType.Textile,
        WasteType.UsedCookingOil,
    ],
    [DisposalMethod.Composting]: [
        WasteType.FoodKitchenWaste,
        WasteType.AnimalManure,
        WasteType.LandscapeWaste,
    ],
    [DisposalMethod.EnergyRecovery]: [WasteType.WoodWaste, WasteType.FoodWaste],
};

function getRandom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDateIn2025() {
    const start = new Date("2025-01-01").getTime();
    const end = new Date("2025-08-11").getTime();
    return new Date(start + Math.random() * (end - start));
}

async function main() {
    const password1 = await bcrypt.hash('hashedpassword123', 10);
    const password2 = await bcrypt.hash('hashedpassword456', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'jingyi012@gmail.com' },
        update: {},
        create: {
            email: 'jingyi012@gmail.com',
            passwordHash: password1,
            role: 'Academic Staff',
            profile: {
                create: {
                    name: 'Jing Yi',
                    staffMatricNo: 'STAFF001',
                    department: 'Malaysia-Japan Advanced Research Centre',
                    position: 'UTM Staff',
                    contactNo: '011-12345678'
                }
            }
        }
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
            email: 'jane@example.com',
            passwordHash: password2,
            role: 'Non-academic Staff',
            profile: {
                create: {
                    name: 'Jane Smith',
                    staffMatricNo: 'STAFF002',
                    department: 'Malaysia-Japan Advanced Research Centre',
                    position: 'UTM Staff',
                    contactNo: '012-87654321'
                }
            }
        }
    });

    const wasteData = [];

    for (let i = 0; i < 30; i++) {
        const disposalMethod = getRandom(Object.values(DisposalMethod));
        const validWasteTypes = disposalTypeMap[disposalMethod];
        const wasteType = getRandom(validWasteTypes);

        wasteData.push({
            wasteType,
            wasteWeight: Number((Math.random() * 50 + 1).toFixed(2)), // 1kg–50kg
            disposalMethod,
            location: RecordLocation.BPAJTNCP,
            status: getRandom(Object.values(WasteRecordStatus)),
            campus: getRandom(Object.values(Campus)),
            date: getRandomDateIn2025(),
            createdById: i % 2 === 0 ? user1.id : user2.id,
        });
    }

    await prisma.wasteRecord.createMany({ data: wasteData });

    console.log('✅ Seed complete');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

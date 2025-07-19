import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create User + Profile
    const user1 = await prisma.user.create({
        data: {
            email: 'john@example.com',
            passwordHash: 'hashedpassword123',
            role: 'staff',
            profile: {
                create: {
                    name: 'John Doe',
                    staffMatricNo: 'STAFF001',
                    department: 'Environmental',
                    position: 'Technician',
                    contactNo: '011-12345678'
                }
            }
        }
    })

    const user2 = await prisma.user.create({
        data: {
            email: 'jane@example.com',
            passwordHash: 'hashedpassword456',
            role: 'admin',
            profile: {
                create: {
                    name: 'Jane Smith',
                    staffMatricNo: 'STAFF002',
                    department: 'Waste Management',
                    position: 'Manager',
                    contactNo: '012-87654321'
                }
            }
        }
    })

    // Create Waste Records for user1
    await prisma.wasteRecord.createMany({
        data: [
            {
                wasteType: 'generalWaste',
                wasteWeight: 15.5,
                disposalMethod: 'landfilling',
                location: 'Lab 3',
                status: 'verified',
                campus: 'utmjb',
                date: new Date('2025-06-22'),
                createdById: user1.id
            },
            {
                wasteType: 'generalWaste',
                wasteWeight: 8.2,
                disposalMethod: 'landfilling',
                location: 'Bio Lab',
                status: 'new',
                campus: 'utmKl',
                date: new Date('2025-06-20'),
                createdById: user1.id
            }
        ]
    })

    console.log('✅ Seed complete')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

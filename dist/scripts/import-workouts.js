"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = require("../lib/prisma");
const database_json_1 = __importDefault(require("../../database.json"));
async function importWorkouts() {
    console.log("Starting workout import...");
    try {
        // Clear existing data
        await prisma_1.prisma.workout.deleteMany();
        await prisma_1.prisma.schedule.deleteMany();
        await prisma_1.prisma.hall.deleteMany();
        await prisma_1.prisma.location.deleteMany();
        for (const [locationName, locationData] of Object.entries(database_json_1.default["FIT-ZONE"])) {
            console.log(`Importing location: ${locationName}`);
            const location = await prisma_1.prisma.location.create({
                data: { name: locationName }
            });
            for (const [hallName, hallData] of Object.entries(locationData)) {
                console.log(`  Importing hall: ${hallName}`);
                const hall = await prisma_1.prisma.hall.create({
                    data: {
                        name: hallName,
                        locationId: location.id
                    }
                });
                for (const [day, workouts] of Object.entries(hallData)) {
                    console.log(`    Importing schedule for ${day}`);
                    const schedule = await prisma_1.prisma.schedule.create({
                        data: {
                            day,
                            hallId: hall.id
                        }
                    });
                    for (const workoutName of workouts) {
                        await prisma_1.prisma.workout.create({
                            data: {
                                name: workoutName,
                                scheduleId: schedule.id
                            }
                        });
                    }
                }
            }
        }
        console.log("Workout import completed successfully!");
    }
    catch (error) {
        console.error("Error importing workouts:", error);
        throw error;
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
importWorkouts();
//# sourceMappingURL=import-workouts.js.map
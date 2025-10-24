import "dotenv/config";
import { prisma } from "../lib/prisma";
import workoutData from "../../database.json";

async function importWorkouts() {
  console.log("Starting workout import...");

  try {
    // Clear existing data
    await prisma.workout.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.hall.deleteMany();
    await prisma.location.deleteMany();

    for (const [locationName, locationData] of Object.entries(workoutData["FIT-ZONE"])) {
      console.log(`Importing location: ${locationName}`);
      
      const location = await prisma.location.create({
        data: { name: locationName }
      });

      for (const [hallName, hallData] of Object.entries(locationData)) {
        console.log(`  Importing hall: ${hallName}`);
        
        const hall = await prisma.hall.create({
          data: {
            name: hallName,
            locationId: location.id
          }
        });

        for (const [day, workouts] of Object.entries(hallData)) {
          console.log(`    Importing schedule for ${day}`);
          
          const schedule = await prisma.schedule.create({
            data: {
              day,
              hallId: hall.id
            }
          });

          for (const workoutName of workouts) {
            await prisma.workout.create({
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
  } catch (error) {
    console.error("Error importing workouts:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importWorkouts();

export const VehicaleRunningStatus = (trip_start_date, speed_per_hr, distance_km,) => {
    const now = new Date();
    const leaveTime = new Date(trip_start_date);

    // Calculate the estimated arrival time (eta) based on distance and speed
    const hours = distance_km / speed_per_hr;
    const eta = new Date(leaveTime.getTime() + hours * 60 * 60 * 1000);

    const totalTime = eta - leaveTime; // Total time for the journey in milliseconds
    const elapsedTime = now - leaveTime; // Elapsed time in milliseconds

    // Calculate progress percentage
    const progress = (elapsedTime / totalTime) * 100;

    // Ensure progress is between 0% and 100%
    return (Math.min(Math.max(progress, 0), 100) < 100);
};
/** @module DeCasteljau */

/**
 * This function takes control points for a spline and should calculate a new
 *  array of interpolated curve points according to De Casteljau's algorithm
 * @param {Array<number>} p0 Spline's starting control point
 * @param {Array<number>} p1 Spline's first approximated control point
 * @param {Array<number>} p2 Spline's second approximated control point
 * @param {Array<number>} p3 Spline's end control point
 * @param {number} tStep Step between 0 and 1 at which to place new spline
 *  points
 * @returns {Array<number>} Array of interpolated spline points
 */
export default function deCasteljau(p0, p1, p2, p3, tStep) {
    // Array for final spline curve points
    const splinePoints = [];
    // Add starting point of spline
    splinePoints.push(p0);

    // Add control points of spline
    // TASK2: Do not add the actual control points themselves
    splinePoints.push(p1);
    splinePoints.push(p2);

    // Number of points to add to the spline
    const numQPoints = parseInt(1 / tStep);

    // Iterate with tStep. Each iteration add one new point to the spline.
    for (let i = 0; i < numQPoints - 1; i++) {
        const t = (i+1) * tStep;
        let currentPoints = [];
        // Add original spline control points for interpolation
        currentPoints.push(p0);
        currentPoints.push(p1);
        currentPoints.push(p2);
        currentPoints.push(p3);

        // Interpolate while possible
        while (currentPoints.length > 1) {
            const nextPoints = [];
            // Iterate through current points
            for (let j = 1; j < currentPoints.length; j++) {
                // TASK2: Interpolate one new point from two current ones
                
                // TASK2: and add it to the points array for next iteration
            }
            // Set new current points for next iteration
            currentPoints = nextPoints;
        }
        // TASK2: Add the fully interpolated point Q_1(t) to the final spline
        //        curve array
        
    }

    // Add end point of spline
    splinePoints.push(p3);
    return splinePoints;
}

/**
 * This function receives two points a and b and should return a new point that
 * is placed between them. The parameter t determines the step/distance between
 * a and b that the new point should be placed at.
 * @param {Array<number>} a The first 2D point
 * @param {Array<number>} b The second 2D point
 * @param {number} t The step/distance between points a and b 
 * @returns {Array<number>} The new point between a and b at step t
 */
function interpolatePoint(a, b, t) {
    // TASK2: Calculate the interpolated point between points a and b
    //        with parameter t
    //        You can access the points' components with point[index]
    return [
        // first component of new point,
        // second component of new point
    ];
}
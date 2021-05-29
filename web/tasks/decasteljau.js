/** @module DeCasteljau */

// TODO: Remove lines that should be part of task

export default function deCasteljau(p0, p1, p2, p3, tStep) {
    const points = [];
    points.push(p0);

    // TASK: Do not add the control points themselves
    // points.push(p1);
    // points.push(p2);

    const numQPoints = parseInt(1 / tStep);

    for (let i = 0; i < numQPoints - 1; i++) {
        const t = (i+1) * tStep;
        let currentSegments = [];
        currentSegments.push([p0, p1]);
        currentSegments.push([p1, p2]);
        currentSegments.push([p2, p3]);
        let nextSegments = [];

        while (currentSegments.length > 1) {
            // TASK: implement the missing part of De Casteljau's algorithm
            for (let j = 1; j < currentSegments.length; j++) {
                const a = calculateConnectionPoint(
                    currentSegments[j-1][0], currentSegments[j-1][1], t
                );
                const b = calculateConnectionPoint(
                    currentSegments[j][0], currentSegments[j][1], t
                );
                nextSegments.push([a, b]);
            }

            currentSegments = nextSegments;
            nextSegments = [];
        }
        // TASK: Add the newly calculated point to the results
        points.push(
            calculateConnectionPoint(
                currentSegments[0][0], currentSegments[0][1], t)
        );
    }

    points.push(p3);
    return points;
}

function calculateConnectionPoint(a, b, t) {
    // TASK: Calculate the interpolated point between points a and b with t
    const connectionPoint = [
        (1-t) * a[0] + t * b[0],
        (1-t) * a[1] + t * b[1]
    ];
    return connectionPoint
}
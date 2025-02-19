document.addEventListener("DOMContentLoaded", function () {
    const width = 1100, height = 900;

    const svg = d3.select("#viz")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .attr("width", width)
        .attr("height", height)
        .attr("style", `max-width: 100%; height: auto; display: block; margin: auto; background: hsl(0, 0.00%, 100.00%); cursor: pointer;`);

    const tooltip = d3.select("#tooltip");
    let focus;

    // colours
    const materialColors = {
        "Non-recyclable": "#d3d3d3", // Light Grey
        "Paper": "#f8de7e",         // Pastel Yellow
        "Vegetable": "#a1c181",     // Pastel Green
        "Iron": "#ff6961",          // Pastel Red
        "Glass": "#9db4ff"          // Pastel Blue
    };

    const opacityScale = d3.scaleLinear().domain([0.1, 0.7]).range([0.1, 1]);

    // data structure
    const data = {
        name: "Lausanne",
        children: Array.from({ length: 18 }, (_, i) => {
            const recyclingEfficiency = Math.random() * 0.3 + 0.3;
            return {
                name: `District ${i + 1}`,
                waste_total: Math.random() * 1000000 + 500000,
                recyclingEfficiency: recyclingEfficiency,
                children: [
                    { name: "Non-recyclable", value: Math.random() * 500000 },
                    { name: "Paper", value: Math.random() * 250000 },
                    { name: "Glass", value: Math.random() * 150000 },
                    { name: "Iron", value: Math.random() * 20000 },
                    { name: "Vegetable", value: Math.random() * 180000 }
                ]
            };
        })
    };

    // hierarchy and layout
    const pack = d3.pack()
        .size([width - 100, height - 100]) // prevent clipping
        .padding(4);

    const root = pack(d3.hierarchy(data)
        .sum(d => d.value || d.waste_total)
        .sort((a, b) => b.value - a.value));

    focus = root;
    let view = [focus.x, focus.y, focus.r * 3]; // zoomed out a bit more for better framing at init

    // circles
    const node = svg.append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1)) // exclude root
        .join("circle")
        .attr("fill", d => materialColors[d.data.name] || "#000000")
        .attr("opacity", d => d.depth === 1 ? opacityScale(d.data.recyclingEfficiency || 0.5) : 1)
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function () { d3.select(this).attr("stroke", "#000"); })
        .on("mouseout", function () { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

    // text labels
    const label = svg.append("g")
        .style("font", "14px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data.name);

    // zooming
    svg.on("click", (event) => zoom(event, root));
    zoomTo(view);

    function zoomTo(v) {
        const k = width / v[2];
        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
    }

    function zoom(event, d) {
        focus = d;

        const transition = svg.transition()
            .duration(750)
            .tween("zoom", () => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 3]);
                return t => zoomTo(i(t));
            });

        label.filter(function (d) {
            return d.parent === focus || d3.select(this).style("display") === "inline";
        })
            .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function (d) {
                if (d.parent === focus) d3.select(this).style("display", "inline");
            })
            .on("end", function (d) {
                if (d.parent !== focus) d3.select(this).style("display", "none");
            });
    }
});

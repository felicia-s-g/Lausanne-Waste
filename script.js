document.addEventListener("DOMContentLoaded", function () {
  const width = window.innerWidth, height = window.innerHeight;
  
  const svg = d3.select("#viz")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .attr("style", `max-width: 100%; height: auto; display: block; margin: auto; background: hsl(152,80%,90%); cursor: pointer;`);
  
  const tooltip = d3.select("#tooltip");
  
  // colours
  const materialColors = {
      "Non-recyclable": "#d3d3d3", // Light Grey
      "Paper": "#f8de7e",         // Pastel Yellow
      "Vegetable": "#a1c181",     // Pastel Green
      "Iron": "#ff6961",          // Pastel Red
      "Glass": "#9db4ff"          // Pastel Blue
  };
  
  const opacityScale = d3.scaleLinear().domain([0.1, 0.6]).range([0.1, 1]);
  
  // Fake data structure
  const data = {
    name: "Lausanne",
    children: Array.from({ length: 18 }, (_, i) => {
      const recyclingEfficiency = Math.random() * 0.3 + 0.3;
      return {
        name: `District ${i + 1}`,
        waste_total: Math.random() * 1000000 + 500000,
        recyclingEfficiency,
        children: [
          { name: "Non-recyclable", value: Math.random() * 500000 },
          { name: "Paper", value: Math.random() * 250000 },
          { name: "Glass", value: Math.random() * 150000 },
          { name: "Iron", value: Math.random() * 20000 },
          { name: "Vegetable", value: Math.random() * 180000 },
        ],
      };
    }),
  };
  
  // FAKE placeholders for demographics and material values
  data.children.forEach((district) => {
    const totalPop = Math.floor(Math.random() * 80000) + 5000;
    const swissPop = Math.floor(totalPop * (Math.random() * 0.5 + 0.4));
    district.fakePopulation = totalPop;
    district.fakeSwiss = swissPop;
    district.fakeNonSwiss = totalPop - swissPop;

    district.children.forEach((mat) => {
      mat.fakeValue = Math.floor(Math.random() * 200000);
    });
  });
  
  // hierarchy and layout
  const pack = d3.pack()
      .size([width - 100, height - 100])
      .padding(4);
  
  const root = pack(d3.hierarchy(data)
      .sum(d => d.value || d.waste_total)
      .sort((a, b) => b.value - a.value));

  focus = root;
  let view = [focus.x, focus.y, focus.r * 4.2];
  
  // circles
  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
    .attr("fill", (d) => materialColors[d.data.name] || "#000000")
    .attr("opacity", (d) =>
      d.depth === 1 ? opacityScale(d.data.recyclingEfficiency || 0.5) : 1
    )
    .attr("pointer-events", function(d) {
      if (focus === root) {
        // When in root view, only districts (depth === 1) have pointer events
        return d.depth === 1 ? "all" : "none";
      } else {
        // When zoomed in, both districts and waste types have pointer events
        return (d.depth === 1 || d.depth === 2) ? "all" : "none";
      }
    })
    .on("mouseover", function (event, d) {
      const content = getTooltipContent(d);
      if (content) {
        d3.select(this).attr("stroke", "#000");
        tooltip.style("display", "block").html(content);
      }
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", null);
      tooltip.style("display", "none");
    })
    .on("click", (event, d) => {
      // Only allow zooming if we're at root level and clicking on a district
      if (focus === root && d.depth === 1) {
        zoom(event, d);
        event.stopPropagation();
      }
    });
  
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

  // Tooltip helper
  function getTooltipContent(d) {
    // Show district tooltips when zoomed out
    if (d.depth === 1) {
      return `
        <strong>${d.data.name}</strong><br/>
        Population: ${d.data.fakePopulation || "N/A"}<br/>
        Swiss: ${d.data.fakeSwiss || "N/A"}<br/>
        Non-Swiss: ${d.data.fakeNonSwiss || "N/A"}
      `;
    }
    // Show waste type tooltips when zoomed in on a district
    else if (d.depth === 2 && focus !== root) {
      return `
        <strong>${d.data.name}</strong><br/>
        Value: ${d.value.toFixed(0)} kg
      `;
    }
    return "";
  }
  
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
    
    // Update pointer-events after zoom
    node.attr("pointer-events", function(d) {
      if (focus === root) {
        // When in root view, only districts have pointer events
        return d.depth === 1 ? "all" : "none";
      } else {
        // When zoomed in, both districts and waste types have pointer events
        return (d.depth === 1 || d.depth === 2) ? "all" : "none";
      }
    });
    
    const transition = svg.transition()
          .duration(750)
          .tween("zoom", () => {
              const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 4.2]);
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
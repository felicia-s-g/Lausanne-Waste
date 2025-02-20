  const width = window.innerWidth, height = window.innerHeight;
  
  const svg = d3.select("#viz")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .attr("style", `max-width: 100%; height: auto; display: block; margin: auto; background: #f4f4f4; cursor: pointer;`);

  
  const tooltip = d3.select("#tooltip");
  const overlayContainer = d3.select("#overlay-container");
  let level = true;
  let labels = "";
  let population = "";
  // colours
  const materialColors = {
      "Non-recyclable": "#d3d3d3", // Light Grey
      "Paper": "#f8de7e",         // Pastel Yellow
      "Vegetable": "#a1c181",     // Pastel Green
      "Iron": "#ff6961",          // Pastel Red
      "Glass": "#9db4ff"          // Pastel Blue
  };
  
    //const opacityScale = d3.scaleLinear().domain([0.1, 0.6]).range([0.1, 1]);
  
    const opacityScale = d3.scaleLinear()
    .domain([0.82, 0.34])          // note: reversed
    .range(["#006d2c", "#edf8e9"]);  

    const data = await d3.json('data.json');
    console.log(data);
    function getDistrict(j){
      for (const element of j) {
        console.log(element.name);
        labels += `<li>${element.name}</li>`;
        population += ` <div class="bar" style="width: 90%;">${element.swiss + element.foreign}</div>`
      }
    }

getDistrict(data.children);
console.log(labels);
console.log(population);
 
    
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
      console.log("UUUUUU");
      if (focus === root && d.depth === 1) {
        zoom(event, d);
        event.stopPropagation();
        console.log(d)

      }
      if (level) {
        const side = getSidebarContent1(d);
        overlayContainer.html(side);
        level = false;
      }
      else if (!level){
        const side = getSidebarContent2(d);
        overlayContainer.html(side);
        level = true;
      }

    });
  
    // text labels
    const label = svg.append("g")
        .style("font", "20px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data.name);



  // sidebar helper
  function getSidebarContent1(d) {
      return `
          <strong>${d.data.name}</strong><br/>
          Population: ${d.data.swiss+d.data.foreign || "N/A"}<br/>
          Swiss: ${d.data.swiss || "N/A"}<br/>
          Non-Swiss: ${d.data.foreign || "N/A"}<br/>
          Swiss percentage: ${d.data.swiss_percentage || "N/A"} %
        `;
  }      

  // sidebar helper
  function getSidebarContent2(d) {
      
    
    return `
        <div class="city-list">
                <ul>
                    ${labels}
                </ul>
            </div>
    
            <div class="bar-chart">
                ${population}
            </div>
      `;
  }      
  // Tooltip helper
  function getTooltipContent(d) {
    // focus.depth === 0 => zoomed out (root)
    // focus.depth === 1 => zoomed in on a district
    // d.depth === 1 => district
    // d.depth === 2 => material

    // Zoomed out => show district tooltips only
    if (focus.depth === 0 && d.depth === 1) {
      return `
          <strong>${d.data.name}</strong><br/>
          Population: ${d.data.swiss+d.data.foreign || "N/A"}<br/>
          Swiss: ${d.data.swiss || "N/A"}<br/>
          Non-Swiss: ${d.data.foreign || "N/A"}<br/>
          Swiss percentage: ${d.data.swiss_percentage || "N/A"} %
        `;
    }

    // Zoomed in on a district => show material tooltips only
    if (focus.depth === 1 && d.depth === 2) {
      return `
          <strong>${d.data.name}</strong><br/>
          ${d.data.percentage} <br/>
          ${d.data.value || "N/A"} kg
        `;
    }

    // Otherwise, no tooltip
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
        console.log("root");
        const side = getSidebarContent2(d);
        overlayContainer.html(side);
        level = true;
        return d.depth === 1 ? "all" : "none";
      } else {
        // When zoomed in, both districts and waste types have pointer events
        console.log("notroot");
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


  // Create the toggle button in HTML
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Toggle Population Influence";
  toggleButton.style.position = "absolute";
  toggleButton.style.top = "20px";
  toggleButton.style.left = "20px";
  toggleButton.style.zIndex = "10";
  document.body.appendChild(toggleButton);

  let moveCircles = false;

  toggleButton.addEventListener("click", () => {
    moveCircles = !moveCircles;
    updateCirclePositions();
  });

  function updateCirclePositions() {
    node.transition().duration(500).attr("transform", d => {
      let parentOffsetX = 0;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -300 : 300) : 0;
        }
      }
      let offsetX = 0;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -300 : 300) : 0;
      }
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1])})`;
    });

    label.transition().duration(500).attr("transform", d => {
      let parentOffsetX = 0;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -300 : 300) : 0;
        }
      }
      let offsetX = 0;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -300 : 300) : 0;
      }
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1])})`;
    });
  }

  function getXPosition(percentage) {
    return (percentage / 100) * 1200;
}

  function updateCirclePositions2() {
    node.transition().duration(500).attr("transform", d => {
      let parentOffsetX = 40;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -400 : 400) : 40;
        }
      }
      let offsetX = 40;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -400 : 400) : 40;
      }
      return `translate(${(parentOffsetX + offsetX)}, ${(d.y - view[1])})`;
    });

    label.transition().duration(500).attr("transform", d => {
      let parentOffsetX = 40;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -400 : 400) : 40;
        }
      }
      let offsetX = 40;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -400 : 400) : 40;
      }
      return `translate(${(parentOffsetX + offsetX)}, ${(d.y - view[1])})`;
    });
  }

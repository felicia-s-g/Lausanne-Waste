const width = window.innerWidth, height = window.innerHeight;


const svg = d3.select("#viz")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("width", width)
  .attr("height", height)
  .attr("style", `max-width: 100%; height: auto; display: block; margin: auto; background: #000; cursor: pointer;`);



const tooltip = d3.select("#tooltip");
const demog = d3.select("#demog");
const flexBar = d3.select("#flex-bar");

let level = true;
let labels = "";
let population = "";
let table = "";
// colours
const materialColors = {
  "Non-recyclable": "#8A3FFC", // Light Grey
  "Paper": "#D2A106",         // Pastel Yellow
  "Vegetable": "#007D79",     // Pastel Green
  "Iron": "#D12771",          // Pastel Red
  "Glass": "#4589FF"          // Pastel Blue
};

//const opacityScale = d3.scaleLinear().domain([0.1, 0.6]).range([0.1, 1]);

// Highlight function
function highlightDistrict(districtId, highlight = true) {
  const row = document.querySelector(`#district-row-${districtId}`);
  if (row) {
    if (highlight) {
      row.classList.add('highlighted');
    } else {
      row.classList.remove('highlighted');
    }
  }
}

const opacityScale = d3.scaleLinear()
  .domain([0.82, 0.34])          // note: reversed
  .range(["#006d2c", "#edf8e9"]);


const populationScale = d3.scaleLinear()
  .domain([1000, 17000])          // note: reversed
  .range([20, 100]);

const data = await d3.json('data.json');
console.log(data);
function getDistrict(j) {
  for (const element of j) {
    let ratioPop = populationScale(element.swiss + element.foreign);
    table += `
      <tr id="district-row-${element.id}">
          <td>${element.name}</td>
          <td><div class="bar" style="width: ${ratioPop}%;">${element.swiss + element.foreign}</div></td>
      </tr>
    `

    labels += `<li>${element.name}</li>`;
    population += ` <div class="bar" style="width: 90%;">${element.swiss + element.foreign}</div>`
  }
}

getDistrict(data.children);


// hierarchy and layout

const pack = d3.pack()
  .size([width, height])
  .padding(10); // Parent nodes get more padding


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
  .attr("fill", (d) => materialColors[d.data.name] || "#egegeg")
  .attr("stroke", (d) => d.children ? "white" : "none") // Apply stroke only to leaf nodes (outermost circles)
  .attr("stroke-width", (d) => d.children ? d.data.scaled_rec_efficiency_per_capita/7 : 0) // Apply stroke only to leaf nodes
  .attr("opacity", (d) =>
    d.depth === 1 ? opacityScale(d.data.recyclingEfficiency || 0.5) : 1
  )
  .attr("pointer-events", function (d) {
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
      tooltip.style("display", "block").html(content);
    }
    // Add highlight when hovering over district
    if (d.depth === 1) {
      highlightDistrict(d.data.id, true);
    }
  })
  .on("mousemove", function (event) {
    tooltip
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px");
  })
  .on("mouseout", function (event, d) {
    tooltip.style("display", "none");
    // Remove highlight when mouse leaves district
    if (d.depth === 1) {
      highlightDistrict(d.data.id, false);
    }
  })
  .on("click", (event, d) => {
    // Zoom logic: Only allow zooming if clicking on a district (depth 1) or material (depth 2)

    zoom(event, d);
      event.stopPropagation();
    // Check if you are at the root level or district level
    if (focus === root) {
      // If at the root level, show sidebar content for root level (getSidebarContent1)
      const side = getSidebarContent2(d);
      demog.html(side);
      flexBar.html("");
      level = false;
    } else if (focus.depth === 1) {
      // If at the district level, show sidebar content for district (getSidebarContent2)
      const side = getSidebarContent1(d);
      demog.html("");
      flexBar.html(side);
      level = true;
    } else if (focus.depth === 2) {
      // If at the district level, show sidebar content for district (getSidebarContent2)
      const side = getSidebarContent3(d);
      demog.html("");
      flexBar.html(side);
      level = true;
    }
  });

const label = svg.append("g")
  .style("font", "20px sans-serif")
  .attr("pointer-events", "none")
  .selectAll("text")
  .data(root.descendants().slice(1)) // Exclude root if needed
  .join("text")
  .attr("text-anchor", "middle") // Center text horizontally
  .style("fill-opacity", d => d.parent === root ? 1 : 0)
  .style("display", d => d.parent === root ? "inline" : "none")
  .style("fill", "white") // Improve visibility
  .text(d => d.data.name);


// sidebar helper
function getSidebarContent1(d) {
  return `
          <strong>${d.data.name}</strong><br/>
          Population: ${d.data.swiss + d.data.foreign || "N/A"}<br/>
          Swiss: ${d.data.swiss || "N/A"}<br/>
          Non-Swiss: ${d.data.foreign || "N/A"}<br/>
          Swiss percentage: ${d.data.swiss_percentage || "N/A"} %
        `;
}

// sidebar helper
function getSidebarContent2(d) {


  return `
        <div class="table-container">
            <table>
                <tbody>
                    ${table}
                </tbody>
            </table>
        </div>
      `;
}

// sidebar helper
function getSidebarContent3(d) {


  return `
         <strong>${d.data.name}</strong><br/>
          Population: ${d.data.percentage || "N/A"}<br/>
          Swiss: ${d.data.value || "N/A"}
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
          Population: ${d.data.swiss + d.data.foreign || "N/A"}<br/>
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

// function zoomTo(v) {
//   const k = width / v[2];
//   view = v;

//   label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
//   node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
//   node.attr("r", d => d.r * k);
// }

function zoomTo(v) {
  const k = width / v[2];
  view = v;

  node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  node.attr("r", d => d.r * k);

  // Move labels to the top of each circle
  label.attr("transform", d => 
    `translate(${(d.x - v[0]) * k}, ${(d.y - v[1]) * k - d.r * k - 10})`
  );
}

function zoom(event, d) {
  focus = d;

  // Update pointer-events after zoom
  node.attr("pointer-events", function (d) {
    if (focus === root) {
      // When in root view, only districts have pointer events
      const side = getSidebarContent2(d);
      demog.html("");
      flexBar.html(side);
      level = true;
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
  // First, we compute the new radius based on the scale and any layout adjustment
  node.transition()
    .duration(d => Math.random() * 1000 + 500) // Random duration between 500ms and 1500ms
    .delay(d => Math.random() * 500) // Random delay between 0 and 500ms
    .attr("transform", d => {
      let parentOffsetX = 0;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -400 : 400) : 0;
        }
      }
      let offsetX = 0;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -400 : 400) : 0;
      }

      // Update radius (r) with padding and move it accordingly
      let r = d.r;
      if (moveCircles) {
        // Recalculate radius based on the new condition (can adjust this further if needed)
        r = d.r * 1.2; // Example of increasing radius when moveCircles is true
      }
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1])})`;
    });

  // Move labels (random duration & delay per label)
  label.transition()
    .duration(d => Math.random() * 1000 + 500) // Random duration between 500ms and 1500ms
    .delay(d => Math.random() * 500) // Random delay between 0 and 500ms
    .attr("transform", d => {
      let parentOffsetX = 0;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -400 : 400) : 0;
        }
      }
      let offsetX = 0;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -400 : 400) : 0;
      }
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1]) - d.r})`;
    });
}


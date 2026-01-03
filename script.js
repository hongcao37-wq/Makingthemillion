let chart;

function calculate() {
    const monthly = parseFloat(document.getElementById('monthly').value) || 1000;
    const annualRate = (parseFloat(document.getElementById('return').value) || 7) / 100;
    const annualContrib = monthly * 12;

    let portfolio = 0;
    let totalContrib = 0;
    let totalReturns = 0;

    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '';
    
    const yearsData = [];
    const contribData = [];
    const returnsData = [];

    const milestones = [];
    const milestoneTargets = [100000, null, 500000, 1000000]; // null = crossover
    const milestoneTexts = [
        "Your portfolio will reach $100K. Most of the value comes from your contributions",
        "Your money begins to work harder than you",
        "Your portfolio will reach $500K",
        "Your Portfolio will reach $1M. Most of the value comes from investment returns"
    ];

    let crossoverFound = false;

    for (let year = 1; year <= 40; year++) {
        const startBalance = portfolio;
        
        // Add contribution at beginning of year
        portfolio += annualContrib;
        totalContrib += annualContrib;
        
        // Calculate return on the new balance
        const yearReturn = portfolio * annualRate;
        portfolio += yearReturn;
        totalReturns = portfolio - totalContrib;

        // Round values to whole dollars for display
        const displayYearReturn = Math.round(yearReturn);
        const displayTotalReturns = Math.round(totalReturns);
        const displayPortfolio = Math.round(portfolio);

        // Table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>$${annualContrib.toLocaleString(undefined, {minimumFractionDigits: 0})}</td>
            <td>$${displayYearReturn.toLocaleString()}</td>
            <td>$${totalContrib.toLocaleString(undefined, {minimumFractionDigits: 0})}</td>
            <td>$${displayTotalReturns.toLocaleString()}</td>
            <td>$${displayPortfolio.toLocaleString()}</td>
        `;

        // Milestone checks
        if (milestones.length < 4) {
            if (milestoneTargets[milestones.length] === null) {
                if (!crossoverFound && yearReturn > annualContrib) {
                    row.classList.add('highlight');
                    milestones.push(`Year ${year}: ${milestoneTexts[milestones.length]}`);
                    crossoverFound = true;
                }
            } else {
                if (portfolio >= milestoneTargets[milestones.length]) {
                    row.classList.add('highlight');
                    milestones.push(`Year ${year}: ${milestoneTexts[milestones.length]}`);
                }
            }
        }

        tbody.appendChild(row);

        // Add data for chart only every 10 years (for readability)
        if (year % 10 === 1 || year === 40) {
            yearsData.push(year);
            contribData.push(Math.round(totalContrib));
            returnsData.push(Math.round(totalReturns));
        }
    }

    // Milestones display (unchanged)
    const milestonesDiv = document.getElementById('milestones');
    if (milestones.length > 0) {
        milestonesDiv.innerHTML = `
            <h2>Key Milestones</h2>
            <ol>
                ${milestones.map(m => `<li>${m}</li>`).join('')}
            </ol>
            ${milestones.length < 4 ? '<p><em>Some milestones not reached within 40 years with current settings.</em></p>' : ''}
        `;
    } else {
        milestonesDiv.innerHTML = '<p>No milestones reached yet. Try increasing contribution or return rate!</p>';
    }

    // Update chart to stacked bar
    if (chart) chart.destroy();
    const ctx = document.getElementById('growthChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearsData,
            datasets: [
                {
                    label: 'Total Contributions',
                    data: contribData,
                    backgroundColor: '#3498db'
                },
                {
                    label: 'Investment Returns',
                    data: returnsData,
                    backgroundColor: '#e67e22'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Portfolio Growth Over Time (Stacked)'
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

// Run on load
window.onload = calculate;
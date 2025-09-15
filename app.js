// Team member data from JSON
const teamData = {
    "BCM Group": {
        "members": [
            "Phil McDonald", "Dwayne Smith", "Ann Reilly", "Max McDonald",
            "Tat Hamilton", "Damien Muscgrave", "Al Kewley", "Mads Lantz",
            "Hugo Brown", "Giv Ryan", "Shaun Egan", "Sam Boyd",
            "Stevan Shanks", "Mike Rolf", "Damien Doonan", "Miguel Gadea",
            "Bryce Schneider", "Laura Furness", "Ricky Morelli", "Ellie Fraser",
            "Dave Mooney"
        ]
    },
    "IVY PR": {
        "members": [
            "Mia Hamilton", "Emma Bedsor", "Caley O'Neil",
            "Bella Devencorn", "Laura Matthews", "Ella More"
        ]
    },
    "VERACITY": {
        "members": [
            "Erin Core", "Ashley Templeton-Browne"
        ]
    }
};

// Classic wheel of fortune colors - bright and vibrant
const wheelColors = [
    '#FF4444', // Bright Red
    '#4444FF', // Bright Blue
    '#44DD44', // Bright Green
    '#FFDD44', // Bright Yellow
    '#FF8844', // Bright Orange
    '#8844FF', // Bright Purple
    '#44DDFF', // Bright Cyan
    '#FF44DD', // Bright Pink
    '#DD4444', // Deep Red
    '#44AA44', // Forest Green
    '#FF6644', // Red Orange
    '#6644FF', // Blue Purple
    '#44FF88', // Spring Green
    '#FF88AA', // Rose Pink
    '#88AAFF', // Sky Blue
    '#FFAA44', // Golden Orange
    '#AA44FF', // Purple Violet
    '#44FFAA'  // Mint Green
];

class WheelOfFortune {
    constructor() {
        this.wheel = document.querySelector('.wheel');
        this.spinBtn = document.getElementById('spinBtn');
        this.selectedNameEl = document.getElementById('selectedName');
        this.teamCountsEl = document.getElementById('teamCounts');
        this.isSpinning = false;
        this.currentRotation = 0;
        this.segments = [];
        
        // Member management elements
        this.memberNameInput = document.getElementById('memberName');
        this.memberDivisionSelect = document.getElementById('memberDivision');
        this.addMemberBtn = document.getElementById('addMemberBtn');
        this.membersContainer = document.getElementById('membersContainer');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.csvFileInput = document.getElementById('csvFileInput');
        this.toggleMemberMenuBtn = document.getElementById('toggleMemberMenu');
        this.memberManagement = document.getElementById('memberManagement');
        
        // PIN protection elements
        this.pinModal = document.getElementById('pinModal');
        this.pinInput = document.getElementById('pinInput');
        this.pinDots = document.getElementById('pinDots');
        this.cancelPinBtn = document.getElementById('cancelPinBtn');
        this.submitPinBtn = document.getElementById('submitPinBtn');
        this.pinError = document.getElementById('pinError');
        
        // PIN configuration
        this.correctPin = '0001';
        
        this.init();
    }
    
    init() {
        this.createSegments();
        this.drawWheel();
        this.showTeamCounts();
        this.spinBtn.addEventListener('click', () => this.spin());
        
        // Initialize member management
        this.setupMemberManagement();
        this.displayMembers();
        
        // Show initial message
        this.selectedNameEl.textContent = "🎯 Click SPIN to select a team member!";
        this.selectedNameEl.style.opacity = "0.8";
        this.selectedNameEl.style.fontSize = "var(--font-size-lg)";
        this.selectedNameEl.style.border = "2px dashed var(--color-border)";
        this.selectedNameEl.style.background = "var(--color-bg-1)";
    }
    
    createSegments() {
        let colorIndex = 0;
        
        // Flatten all members into segments array
        Object.entries(teamData).forEach(([division, data]) => {
            data.members.forEach((member, memberIndex) => {
                this.segments.push({
                    name: member,
                    division: division,
                    color: wheelColors[colorIndex % wheelColors.length],
                    index: this.segments.length
                });
                colorIndex++;
            });
        });
        
        console.log('Created segments:', this.segments.length);
    }
    
    showTeamCounts() {
        const teamCounts = {};
        Object.entries(teamData).forEach(([division, data]) => {
            teamCounts[division] = data.members.length;
        });
        
        const countsHtml = Object.entries(teamCounts).map(([division, count]) => {
            const sampleColor = this.segments.find(s => s.division === division)?.color || '#666';
            return `
                <div class="team-count-item">
                    <div class="team-count-color" style="background-color: ${sampleColor}"></div>
                    <span>${division}: ${count} members</span>
                </div>
            `;
        }).join('');
        
        this.teamCountsEl.innerHTML = countsHtml;
    }
    
    drawWheel() {
        const totalSegments = this.segments.length;
        const anglePerSegment = 360 / totalSegments;
        const radius = 180;
        const centerX = 200;
        const centerY = 200;
        
        // Clear existing content
        this.wheel.innerHTML = '';
        
        this.segments.forEach((segment, index) => {
            const startAngle = index * anglePerSegment;
            const endAngle = (index + 1) * anglePerSegment;
            
            // Create segment path
            const segmentPath = this.createSegmentPath(
                centerX, centerY, radius, startAngle, endAngle
            );
            
            // Create SVG path element
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('d', segmentPath);
            pathElement.setAttribute('fill', segment.color);
            pathElement.setAttribute('stroke', '#ffffff');
            pathElement.setAttribute('stroke-width', '2');
            pathElement.setAttribute('data-segment', index);
            pathElement.id = `segment-${index}`;
            
            this.wheel.appendChild(pathElement);
            
            // Add text label
            const textAngle = startAngle + anglePerSegment / 2;
            const textRadius = radius * 0.68;
            
            // Calculate text position
            const textAngleRad = (textAngle - 90) * Math.PI / 180;
            const textX = centerX + textRadius * Math.cos(textAngleRad);
            const textY = centerY + textRadius * Math.sin(textAngleRad);
            
            // Create text element
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', textX);
            textElement.setAttribute('y', textY);
            textElement.setAttribute('class', 'segment-text');
            textElement.setAttribute('data-segment', index);
            
            // Rotate text to be readable
            let rotationAngle = textAngle;
            if (textAngle > 90 && textAngle < 270) {
                rotationAngle = textAngle + 180;
            }
            textElement.setAttribute('transform', `rotate(${rotationAngle}, ${textX}, ${textY})`);
            
            // Handle long names with smart text wrapping
            const name = segment.name;
            if (name.length > 12 && name.includes(' ')) {
                const words = name.split(' ');
                const midPoint = Math.ceil(words.length / 2);
                const line1 = words.slice(0, midPoint).join(' ');
                const line2 = words.slice(midPoint).join(' ');
                
                // Create multi-line text
                const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan1.setAttribute('x', textX);
                tspan1.setAttribute('dy', '-0.3em');
                tspan1.textContent = line1;
                
                const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan2.setAttribute('x', textX);
                tspan2.setAttribute('dy', '1.1em');
                tspan2.textContent = line2;
                
                textElement.appendChild(tspan1);
                textElement.appendChild(tspan2);
            } else {
                textElement.textContent = name;
            }
            
            this.wheel.appendChild(textElement);
        });
        
        console.log('Wheel drawn with', totalSegments, 'segments');
    }
    
    createSegmentPath(centerX, centerY, radius, startAngle, endAngle) {
        const startAngleRad = (startAngle - 90) * Math.PI / 180;
        const endAngleRad = (endAngle - 90) * Math.PI / 180;
        
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        
        return [
            "M", centerX, centerY,
            "L", x1, y1,
            "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
            "Z"
        ].join(" ");
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        
        // Reset display
        this.selectedNameEl.classList.remove('show', 'winner');
        this.selectedNameEl.textContent = '🎯 Spinning the wheel...';
        this.selectedNameEl.style.opacity = "0.6";
        this.selectedNameEl.style.border = "2px solid var(--color-border)";
        this.selectedNameEl.style.fontSize = "var(--font-size-lg)";
        this.selectedNameEl.style.background = "var(--color-bg-5)";
        
        // Clear any previous winner highlighting
        this.clearWinnerHighlight();
        
        console.log('Starting spin...');
        
        // Calculate random final position with realistic wheel physics
        const minSpins = 4;
        const maxSpins = 7;
        const randomSpins = minSpins + Math.random() * (maxSpins - minSpins);
        const randomAngle = Math.random() * 360;
        const finalRotation = this.currentRotation + (randomSpins * 360) + randomAngle;
        
        console.log('Final rotation will be:', finalRotation);
        
        // Apply rotation with wheel physics
        this.wheel.classList.add('spinning');
        this.wheel.style.transform = `rotate(${finalRotation}deg)`;
        this.currentRotation = finalRotation;
        
        // Add some excitement with button animation
        this.spinBtn.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => {
            this.spinBtn.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 200);
        
        // Wait for animation to complete
        setTimeout(() => {
            this.wheel.classList.remove('spinning');
            this.determineWinner(finalRotation);
            this.isSpinning = false;
            this.spinBtn.disabled = false;
        }, 3000);
    }
    
    determineWinner(finalRotation) {
        const totalSegments = this.segments.length;
        const anglePerSegment = 360 / totalSegments;
        
        // Normalize the final rotation to 0-360
        const normalizedRotation = ((finalRotation % 360) + 360) % 360;
        
        // The pointer points to the top (0 degrees)
        // Calculate which segment is at the pointer position
        const segmentIndex = Math.floor((360 - normalizedRotation) / anglePerSegment) % totalSegments;
        
        const winner = this.segments[segmentIndex];
        
        console.log('Normalized rotation:', normalizedRotation);
        console.log('Angle per segment:', anglePerSegment);
        console.log('Segment index:', segmentIndex);
        console.log('Winner:', winner);
        
        // Ensure we have a valid winner
        if (!winner) {
            console.error('No winner found, using fallback');
            const randomIndex = Math.floor(Math.random() * this.segments.length);
            const fallbackWinner = this.segments[randomIndex];
            this.displayWinner(fallbackWinner, randomIndex);
        } else {
            this.displayWinner(winner, segmentIndex);
        }
    }
    
    clearWinnerHighlight() {
        // Remove highlighting from all segments
        this.segments.forEach((segment, index) => {
            const segmentEl = document.getElementById(`segment-${index}`);
            if (segmentEl) {
                segmentEl.style.filter = 'none';
                segmentEl.style.strokeWidth = '2';
                segmentEl.style.stroke = '#ffffff';
            }
        });
    }
    
    highlightWinnerSegment(segmentIndex) {
        const segmentEl = document.getElementById(`segment-${segmentIndex}`);
        if (segmentEl) {
            segmentEl.style.filter = 'brightness(1.2) drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))';
            segmentEl.style.strokeWidth = '4';
            segmentEl.style.stroke = '#FFD700';
        }
    }
    
    displayWinner(winner, segmentIndex) {
        // Highlight the winning segment
        this.highlightWinnerSegment(segmentIndex);
        
        // Display winner with celebration after a short delay
        setTimeout(() => {
            this.selectedNameEl.style.opacity = "1";
            this.selectedNameEl.style.fontSize = "var(--font-size-2xl)";
            this.selectedNameEl.style.border = "3px solid #FFD700";
            this.selectedNameEl.style.background = "linear-gradient(135deg, var(--color-bg-2), var(--color-bg-3))";
            this.selectedNameEl.innerHTML = `
                <div style="font-size: var(--font-size-sm); margin-bottom: var(--space-4); opacity: 0.8;">🎉 WINNER 🎉</div>
                <div style="font-weight: var(--font-weight-bold);">${winner.name}</div>
                <div style="font-size: var(--font-size-md); margin-top: var(--space-4); opacity: 0.9;">${winner.division}</div>
            `;
            this.selectedNameEl.classList.add('show', 'winner');
            
            console.log('Displayed winner:', winner.name, winner.division);
            
            // Add celebration effects
            this.celebrateWinner();
        }, 300);
    }
    
    celebrateWinner() {
        // Visual celebration effect
        const wheelBorder = document.querySelector('.wheel-border');
        wheelBorder.style.boxShadow = `
            0 0 30px rgba(255, 215, 0, 0.8),
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3)
        `;
        
        // Make the result container pulse
        const resultContainer = document.querySelector('.result-container');
        resultContainer.style.animation = 'celebrationPulse 2s ease-in-out';
        
        setTimeout(() => {
            wheelBorder.style.boxShadow = `
                0 0 20px rgba(255, 215, 0, 0.5),
                0 8px 32px rgba(0, 0, 0, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.3)
            `;
            resultContainer.style.animation = '';
        }, 2000);
    }
    
    // Member Management Methods
    setupMemberManagement() {
        this.addMemberBtn.addEventListener('click', () => this.addMember());
        this.exportBtn.addEventListener('click', () => this.exportToCSV());
        this.importBtn.addEventListener('click', () => this.csvFileInput.click());
        this.csvFileInput.addEventListener('change', (e) => this.importFromCSV(e));
        this.toggleMemberMenuBtn.addEventListener('click', () => this.showPinModal());
        
        // PIN protection event listeners
        this.cancelPinBtn.addEventListener('click', () => this.hidePinModal());
        this.submitPinBtn.addEventListener('click', () => this.validatePin());
        this.pinInput.addEventListener('input', () => this.updatePinDots());
        this.pinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validatePin();
            }
        });
        
        // Allow Enter key to add member
        this.memberNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addMember();
            }
        });
    }
    
    showPinModal() {
        this.pinModal.style.display = 'flex';
        this.pinInput.value = '';
        this.updatePinDots();
        this.pinError.style.display = 'none';
        this.pinInput.focus();
    }
    
    hidePinModal() {
        this.pinModal.style.display = 'none';
        this.pinInput.value = '';
        this.updatePinDots();
        this.pinError.style.display = 'none';
    }
    
    updatePinDots() {
        const pinValue = this.pinInput.value;
        const dots = this.pinDots.querySelectorAll('.pin-dot');
        
        dots.forEach((dot, index) => {
            if (index < pinValue.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }
    
    validatePin() {
        const enteredPin = this.pinInput.value;
        
        if (enteredPin === this.correctPin) {
            this.hidePinModal();
            this.toggleMemberMenu();
        } else {
            this.pinError.style.display = 'block';
            this.pinInput.value = '';
            this.updatePinDots();
            this.pinInput.focus();
            
            // Shake animation for error
            this.pinModal.classList.add('shake');
            setTimeout(() => {
                this.pinModal.classList.remove('shake');
            }, 500);
        }
    }
    
    toggleMemberMenu() {
        const isVisible = this.memberManagement.style.display !== 'none';
        
        if (isVisible) {
            // Hide menu
            this.memberManagement.classList.remove('show');
            this.memberManagement.classList.add('hide');
            
            setTimeout(() => {
                this.memberManagement.style.display = 'none';
                this.memberManagement.classList.remove('hide');
            }, 250); // Match CSS transition duration
            
            this.toggleMemberMenuBtn.textContent = 'Add/Remove Team Member';
        } else {
            // Show menu
            this.memberManagement.style.display = 'block';
            this.memberManagement.classList.add('show');
            this.toggleMemberMenuBtn.textContent = 'Close Member Menu';
        }
    }
    
    addMember() {
        const name = this.memberNameInput.value.trim();
        let division = this.memberDivisionSelect.value;
        
        if (!name) {
            alert('Please enter a member name');
            return;
        }
        
        // Handle new division creation
        if (division === 'NEW_DIVISION') {
            const newDivisionName = prompt('Enter the name for the new division:');
            if (!newDivisionName || !newDivisionName.trim()) {
                return;
            }
            division = newDivisionName.trim();
        }
        
        // Check if member already exists
        if (teamData[division] && teamData[division].members.includes(name)) {
            alert('This member already exists in the selected division');
            return;
        }
        
        // Add member to team data
        if (!teamData[division]) {
            teamData[division] = { members: [] };
        }
        teamData[division].members.push(name);
        
        // Clear form
        this.memberNameInput.value = '';
        
        // Update division select options
        this.updateDivisionSelect();
        
        // Refresh display and wheel
        this.refreshWheel();
        this.displayMembers();
        this.showTeamCounts();
        
        console.log(`Added member: ${name} to ${division}`);
    }
    
    removeMember(name, division) {
        if (confirm(`Are you sure you want to remove ${name} from ${division}?`)) {
            const index = teamData[division].members.indexOf(name);
            if (index > -1) {
                teamData[division].members.splice(index, 1);
                
                // Remove division if no members left
                if (teamData[division].members.length === 0) {
                    delete teamData[division];
                }
                
                // Refresh display and wheel
                this.refreshWheel();
                this.displayMembers();
                this.showTeamCounts();
                
                console.log(`Removed member: ${name} from ${division}`);
            }
        }
    }
    
    displayMembers() {
        this.membersContainer.innerHTML = '';
        
        Object.entries(teamData).forEach(([division, data]) => {
            const divisionDiv = document.createElement('div');
            divisionDiv.className = 'division-group';
            
            const divisionHeader = document.createElement('h4');
            divisionHeader.textContent = `${division} (${data.members.length} members)`;
            divisionHeader.className = 'division-header';
            divisionDiv.appendChild(divisionHeader);
            
            const membersList = document.createElement('div');
            membersList.className = 'members-list-group';
            
            data.members.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-item';
                
                const memberName = document.createElement('span');
                memberName.textContent = member;
                memberName.className = 'member-name';
                
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.className = 'btn btn--sm btn--outline remove-member-btn';
                removeBtn.addEventListener('click', () => this.removeMember(member, division));
                
                memberDiv.appendChild(memberName);
                memberDiv.appendChild(removeBtn);
                membersList.appendChild(memberDiv);
            });
            
            divisionDiv.appendChild(membersList);
            this.membersContainer.appendChild(divisionDiv);
        });
    }
    
    refreshWheel() {
        this.segments = [];
        this.createSegments();
        this.drawWheel();
    }
    
    exportToCSV() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'team_members.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Exported team data to CSV');
    }
    
    generateCSV() {
        let csv = 'Division,Member Name\n';
        Object.entries(teamData).forEach(([division, data]) => {
            data.members.forEach(member => {
                csv += `"${division}","${member}"\n`;
            });
        });
        return csv;
    }
    
    importFromCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const newTeamData = {};
                
                // Skip header row
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    // Parse CSV line (handle quoted values)
                    const match = line.match(/^"([^"]+)","([^"]+)"$/);
                    if (match) {
                        const division = match[1];
                        const member = match[2];
                        
                        if (!newTeamData[division]) {
                            newTeamData[division] = { members: [] };
                        }
                        newTeamData[division].members.push(member);
                    }
                }
                
                // Update team data
                Object.keys(teamData).forEach(division => delete teamData[division]);
                Object.assign(teamData, newTeamData);
                
                // Update division select options
                this.updateDivisionSelect();
                
                // Refresh display
                this.refreshWheel();
                this.displayMembers();
                this.showTeamCounts();
                
                console.log('Imported team data from CSV');
                alert('Team data imported successfully!');
                
            } catch (error) {
                console.error('Error importing CSV:', error);
                alert('Error importing CSV file. Please check the format.');
            }
        };
        
        reader.readAsText(file);
        // Reset file input
        event.target.value = '';
    }
    
    updateDivisionSelect() {
        const divisions = Object.keys(teamData);
        this.memberDivisionSelect.innerHTML = '';
        
        divisions.forEach(division => {
            const option = document.createElement('option');
            option.value = division;
            option.textContent = division;
            this.memberDivisionSelect.appendChild(option);
        });
        
        // Add option to create new division
        const newOption = document.createElement('option');
        newOption.value = 'NEW_DIVISION';
        newOption.textContent = '+ Add New Division';
        this.memberDivisionSelect.appendChild(newOption);
    }
}

// Initialize the wheel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Team Spinner...');
    new WheelOfFortune();
});
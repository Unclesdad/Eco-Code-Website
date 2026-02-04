/**
 * Eco Code - Animated Crystal Tree Background
 *
 * Features:
 * - Flickering stars
 * - Minimalistic tree with swaying branches
 * - Green crystals that fall and pile up
 * - Parallax scrolling at 0.5x speed
 */

class CrystalTreeBackground {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Configuration
        this.config = {
            starCount: 200,
            crystalColors: [
                '#0a5c36', '#0d7343', '#10894f', '#15a05c',
                '#1db868', '#25d075', '#3de88a', '#5cf0a0',
                '#134e2a', '#1a6b3a', '#22884a'
            ],
            maxTreeCrystals: 100, // More crystals for bigger tree
            maxFallingCrystals: 12,
            crystalRegenRate: 1500, // Faster regen
            swayAmount: 4,
            swaySpeed: 0.0008,
            terminalVelocity: 8, // Faster falling
            gravity: 0.08
        };

        // State
        this.stars = [];
        this.treeCrystals = [];
        this.fallingCrystals = [];
        this.groundCrystals = [];
        this.tree = null;
        this.scrollY = 0;
        this.time = 0;
        this.lastCrystalSpawn = 0;

        // Crystal stacking - track heights across width columns
        this.stackColumns = 20;
        this.stackHeights = new Array(this.stackColumns).fill(0);

        // Shooting stars and spaceships
        this.shootingStars = [];
        this.spaceships = [];

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });

        this.createStars();
        this.createTree();
        this.createInitialCrystals();
        this.createGroundPile();

        this.animate();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;

        // Canvas covers viewport only (fixed position)
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Virtual height for scene elements (parallax space)
        // Make scene tall enough to cover the whole page
        this.sceneHeight = window.innerHeight * 4;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.ctx.scale(dpr, dpr);

        // Recreate elements on resize
        this.createStars();
        this.createTree();
        this.createInitialCrystals();
        this.createGroundPile();
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.config.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.sceneHeight * 0.7, // Stars throughout most of scene
                size: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                flickerSpeed: Math.random() * 0.02 + 0.005,
                flickerOffset: Math.random() * Math.PI * 2
            });
        }
    }

    createTree() {
        const centerX = this.width / 2;
        // Tree positioned lower so top branches are visible
        const trunkTop = this.sceneHeight * 0.12;  // Moved down further
        const trunkBottom = this.sceneHeight * 0.32;  // Extended trunk
        const trunkWidth = Math.min(72, this.width * 0.05) * 1.2;

        this.tree = {
            trunk: {
                x: centerX,
                top: trunkTop,
                bottom: trunkBottom,
                width: trunkWidth
            },
            branches: this.generateRadialBranches(centerX, trunkTop, trunkBottom, trunkWidth),
            roots: this.generateRoots(centerX, trunkBottom, trunkWidth)
        };
    }

    generateRadialBranches(centerX, trunkTop, trunkBottom, trunkWidth) {
        const branches = [];
        const trunkHeight = trunkBottom - trunkTop;

        // Horizontal stretch factor
        const hStretch = 1.5;

        // Branches originate from halfway up the trunk to the top
        const branchZoneTop = trunkTop;
        const branchZoneBottom = trunkTop + trunkHeight * 0.5;

        // Generate branches distributed along the trunk
        const mainBranchCount = 14;

        for (let i = 0; i < mainBranchCount; i++) {
            const heightRatio = Math.pow(i / (mainBranchCount - 1), 0.7);
            const startY = branchZoneTop + heightRatio * (branchZoneBottom - branchZoneTop);

            const side = (i % 2 === 0) ? -1 : 1;
            const baseAngle = side * (Math.PI * 0.15 + (i / mainBranchCount) * Math.PI * 0.35);
            const upwardBias = (1 - heightRatio) * -0.3;
            const angle = baseAngle + upwardBias + (Math.random() - 0.5) * 0.25 - Math.PI / 2;

            const depthValue = Math.random() * 2 - 1;
            const depthThickFactor = 1 + depthValue * 0.2;

            // Branch thickness is 20-40% of trunk width
            const thicknessRatio = 0.2 + Math.random() * 0.2;
            const thickness = trunkWidth * thicknessRatio * depthThickFactor;

            // First segment length - stretched horizontally
            const baseLength = this.width * 0.05 + Math.random() * this.width * 0.03;

            const startX = centerX + (Math.random() - 0.5) * trunkWidth * 0.3;
            // Apply horizontal stretch to the X component
            const endX = startX + Math.cos(angle) * baseLength * hStretch;
            const endY = startY + Math.sin(angle) * baseLength;

            branches.push({
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY,
                thickness: thickness,
                swayOffset: Math.random() * Math.PI * 2,
                children: this.generateTreeChildren(endX, endY, angle, 5, false, depthValue, thickness, hStretch),
                depthValue: depthValue
            });
        }

        // Add some branches pointing more upward from near the top
        for (let i = 0; i < 4; i++) {
            const startY = branchZoneTop + Math.random() * (branchZoneBottom - branchZoneTop) * 0.3;
            const side = (i % 2 === 0) ? -1 : 1;
            const angle = -Math.PI / 2 + side * (Math.random() * 0.4 + 0.1);

            const depthValue = Math.random() * 2 - 1;
            const thicknessRatio = 0.2 + Math.random() * 0.2;
            const thickness = trunkWidth * thicknessRatio;
            const baseLength = this.width * 0.04 + Math.random() * this.width * 0.03;

            const startX = centerX + (Math.random() - 0.5) * trunkWidth * 0.3;
            const endX = startX + Math.cos(angle) * baseLength * hStretch;
            const endY = startY + Math.sin(angle) * baseLength;

            branches.push({
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY,
                thickness: thickness,
                swayOffset: Math.random() * Math.PI * 2,
                children: this.generateTreeChildren(endX, endY, angle, 4, false, depthValue, thickness, hStretch),
                depthValue: depthValue
            });
        }

        // Add two diagonal-down branches to fill empty space beside trunk
        for (let i = 0; i < 2; i++) {
            const side = (i === 0) ? -1 : 1;
            // Start from middle of trunk, angle diagonally down and out
            const startY = branchZoneBottom + trunkHeight * 0.15;
            const startX = centerX + side * trunkWidth * 0.3;
            // Angle: mostly sideways with slight downward tilt
            const angle = side * Math.PI * 0.35 + Math.PI * 0.08;

            const thicknessRatio = 0.25 + Math.random() * 0.1;
            const thickness = trunkWidth * thicknessRatio;
            const baseLength = this.width * 0.045 + Math.random() * 0.02;

            const endX = startX + Math.cos(angle) * baseLength * hStretch;
            const endY = startY + Math.sin(angle) * baseLength;

            branches.push({
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY,
                thickness: thickness,
                swayOffset: Math.random() * Math.PI * 2,
                children: this.generateTreeChildren(endX, endY, angle, 4, false, 0, thickness, hStretch),
                depthValue: 0
            });
        }

        return branches;
    }

    generateTreeChildren(x, y, parentAngle, depth, isContinuation = false, parentDepthValue = 0, parentThickness = 10, hStretch = 1.5) {
        if (depth <= 0) return [];

        const children = [];
        const depthValue = parentDepthValue + (Math.random() - 0.5) * 0.2;

        // Branch length - stretched horizontally
        const baseLength = this.width * (0.03 + Math.random() * 0.02) * (0.7 + depth * 0.1);

        // Fewer branches per split
        const branchCount = depth > 3 ? 2 : (Math.random() < 0.7 ? 2 : (Math.random() < 0.5 ? 1 : 3));

        for (let i = 0; i < branchCount; i++) {
            // Spread branches apart with wider angles
            let angle;
            if (branchCount === 1) {
                angle = parentAngle + (Math.random() - 0.5) * 0.3;
            } else if (branchCount === 2) {
                const spread = 0.3 + Math.random() * 0.25;
                angle = parentAngle + (i === 0 ? -spread : spread);
            } else {
                if (i === 0) {
                    angle = parentAngle + (Math.random() - 0.5) * 0.2;
                } else {
                    const spread = 0.4 + Math.random() * 0.3;
                    angle = parentAngle + (i === 1 ? -spread : spread);
                }
            }

            const length = baseLength * (0.85 + Math.random() * 0.3);
            // Apply horizontal stretch
            const endX = x + Math.cos(angle) * length * hStretch;
            const endY = y + Math.sin(angle) * length;

            // Smooth thickness taper - each child is 60-75% of parent thickness
            const taperRatio = 0.6 + Math.random() * 0.15;
            const thickness = Math.max(1.2, parentThickness * taperRatio);

            children.push({
                startX: x,
                startY: y,
                endX: endX,
                endY: endY,
                thickness: thickness,
                swayOffset: Math.random() * Math.PI * 2,
                children: this.generateTreeChildren(endX, endY, angle, depth - 1, false, depthValue, thickness, hStretch),
                depthValue: depthValue
            });
        }

        return children;
    }

    generateRoots(centerX, treeBottom, trunkWidth) {
        const roots = [];
        const rootCount = 7;  // Fewer, thicker main roots (6-8)

        for (let i = 0; i < rootCount; i++) {
            // Roots spread more horizontally and curve downward
            const baseAngle = (i / (rootCount - 1)) * Math.PI * 1.2 + Math.PI * 0.4;
            const angle = baseAngle + (Math.random() - 0.5) * 0.25;
            const length = this.width * 0.12 + Math.random() * this.width * 0.1;

            const startX = centerX + (Math.random() - 0.5) * trunkWidth * 0.8;
            const endX = startX + Math.cos(angle) * length;
            const endY = treeBottom + Math.sin(angle) * length * 0.5 + 30;

            // Control point for bezier curve - makes roots curve naturally
            const curveAmount = 0.3 + Math.random() * 0.2;
            const cpX = startX + (endX - startX) * 0.5 + (Math.random() - 0.5) * 20;
            const cpY = treeBottom + (endY - treeBottom) * curveAmount;

            roots.push({
                startX: startX,
                startY: treeBottom,
                endX: endX,
                endY: endY,
                cpX: cpX,  // Control point for bezier curve
                cpY: cpY,
                startThickness: trunkWidth * 0.6,  // Thick at base
                endThickness: 2,  // Taper to thin at end
                children: []  // No recursive children - single curved lines
            });
        }

        return roots;
    }

    createInitialCrystals() {
        this.treeCrystals = [];

        // Collect ALL branch endpoints first
        const allEndpoints = [];

        const collectEndpoints = (branch, depth = 0) => {
            // Add endpoint
            allEndpoints.push({
                x: branch.endX,
                y: branch.endY,
                swayOffset: branch.swayOffset,
                depth: depth
            });

            // Add mid-branch point
            if (Math.random() < 0.4) {
                const midX = (branch.startX + branch.endX) / 2;
                const midY = (branch.startY + branch.endY) / 2;
                allEndpoints.push({
                    x: midX,
                    y: midY,
                    swayOffset: branch.swayOffset,
                    depth: depth
                });
            }

            // Recurse into children
            if (branch.children) {
                branch.children.forEach(child => collectEndpoints(child, depth + 1));
            }
        };

        // Collect from all branches
        this.tree.branches.forEach(branch => collectEndpoints(branch, 0));

        // Shuffle endpoints to distribute crystals randomly across tree
        for (let i = allEndpoints.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allEndpoints[i], allEndpoints[j]] = [allEndpoints[j], allEndpoints[i]];
        }

        // Add crystals up to max, distributed across all endpoints
        const crystalCount = Math.min(this.config.maxTreeCrystals, allEndpoints.length);
        for (let i = 0; i < crystalCount; i++) {
            const point = allEndpoints[i];
            this.treeCrystals.push(this.createTreeCrystal(point.x, point.y, point.swayOffset));
        }
    }

    createTreeCrystal(x, y, swayOffset) {
        return {
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            size: 12 + Math.random() * 16,  // Larger crystals
            color: this.config.crystalColors[Math.floor(Math.random() * this.config.crystalColors.length)],
            swayOffset: swayOffset + Math.random() * 0.5,
            rotation: 0,  // Start vertical (hanging from top)
            swayAngle: 0,  // For pendulum swing
            facets: Math.floor(Math.random() * 2) + 5
        };
    }

    createGroundPile() {
        this.groundCrystals = [];
        // Ground pile at the very bottom of the scene (above footer)
        // Position it so it appears just above the footer when scrolled down
        this.groundY = this.sceneHeight * 0.95;
        const pileWidth = this.width * 0.7;
        const pileCenter = this.width / 2;

        // Reset stack heights
        this.stackHeights = new Array(this.stackColumns).fill(0);

        // Create initial pile with proper stacking
        for (let i = 0; i < 40; i++) {
            const x = pileCenter + (Math.random() - 0.5) * pileWidth;
            const size = 4 + Math.random() * 7;

            // Get column and stack height
            const column = Math.floor((x / this.width) * this.stackColumns);
            const clampedColumn = Math.max(0, Math.min(this.stackColumns - 1, column));
            const stackTop = this.groundY - this.stackHeights[clampedColumn];

            // Add crystal on top of stack
            const y = stackTop - size * 0.5;

            this.groundCrystals.push({
                x: x,
                y: y,
                size: size,
                color: this.config.crystalColors[Math.floor(Math.random() * this.config.crystalColors.length)],
                rotation: Math.random() * Math.PI * 2,
                facets: Math.floor(Math.random() * 2) + 5
            });

            // Update stack height for this column
            this.stackHeights[clampedColumn] += size * 0.4;
        }
    }

    spawnShootingStar() {
        if (this.shootingStars.length >= 3) return;

        this.shootingStars.push({
            x: -50,
            y: Math.random() * this.sceneHeight * 0.2,
            speed: 8 + Math.random() * 6,
            length: 50 + Math.random() * 80,
            angle: Math.PI * 0.1 + Math.random() * 0.15,  // Slight downward angle
            brightness: 0.6 + Math.random() * 0.4
        });
    }

    spawnSpaceship() {
        if (this.spaceships.length >= 2) return;

        const goingRight = Math.random() < 0.5;
        this.spaceships.push({
            x: goingRight ? -30 : this.width + 30,
            y: Math.random() * this.sceneHeight * 0.15 + 20,
            speed: (1 + Math.random() * 1.5) * (goingRight ? 1 : -1),
            size: 2 + Math.random() * 2,
            blinkOffset: Math.random() * Math.PI * 2
        });
    }

    updateShootingStars() {
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            return star.x < this.width + 100 && star.y < this.sceneHeight * 0.4;
        });
    }

    updateSpaceships() {
        this.spaceships = this.spaceships.filter(ship => {
            ship.x += ship.speed;
            return ship.x > -50 && ship.x < this.width + 50;
        });
    }

    drawShootingStar(star) {
        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const gradient = this.ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${star.brightness * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${star.brightness})`);

        this.ctx.beginPath();
        this.ctx.moveTo(tailX, tailY);
        this.ctx.lineTo(star.x, star.y);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Bright head
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        this.ctx.fill();
    }

    drawSpaceship(ship) {
        const blink = Math.sin(this.time * 0.1 + ship.blinkOffset) > 0.3;

        // Main body - small dot
        this.ctx.beginPath();
        this.ctx.arc(ship.x, ship.y, ship.size, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(180, 180, 200, 0.6)';
        this.ctx.fill();

        // Blinking light
        if (blink) {
            this.ctx.beginPath();
            this.ctx.arc(ship.x, ship.y, ship.size * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = ship.speed > 0 ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 255, 100, 0.8)';
            this.ctx.fill();
        }
    }

    dropCrystal() {
        if (this.treeCrystals.length === 0) return;
        if (this.fallingCrystals.length >= this.config.maxFallingCrystals) return;

        const index = Math.floor(Math.random() * this.treeCrystals.length);
        const crystal = this.treeCrystals.splice(index, 1)[0];

        this.fallingCrystals.push({
            ...crystal,
            velocity: 0,
            // Keep the current swing angle as starting rotation, then slowly spin
            rotation: crystal.swayAngle || 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,  // Slower rotation while falling
            swayPhase: Math.random() * Math.PI * 2
        });
    }

    regenerateCrystal() {
        if (this.treeCrystals.length >= this.config.maxTreeCrystals) return;

        // Pick a random branch endpoint
        const allBranches = [];
        const collectBranches = (branch) => {
            allBranches.push(branch);
            branch.children.forEach(collectBranches);
        };
        this.tree.branches.forEach(collectBranches);

        if (allBranches.length === 0) return;

        const branch = allBranches[Math.floor(Math.random() * allBranches.length)];
        this.treeCrystals.push(this.createTreeCrystal(branch.endX, branch.endY, branch.swayOffset));
    }

    updateFallingCrystals() {
        this.fallingCrystals = this.fallingCrystals.filter(crystal => {
            // Apply gravity - faster falling
            crystal.velocity = Math.min(crystal.velocity + this.config.gravity, this.config.terminalVelocity);
            crystal.y += crystal.velocity;

            // Gentle sway while falling
            crystal.swayPhase += 0.015;
            crystal.x = crystal.baseX + Math.sin(crystal.swayPhase) * 15;

            // Rotate while falling
            crystal.rotation += crystal.rotationSpeed;

            // Calculate column for stacking
            const column = Math.floor((crystal.x / this.width) * this.stackColumns);
            const clampedColumn = Math.max(0, Math.min(this.stackColumns - 1, column));
            const stackTop = this.groundY - this.stackHeights[clampedColumn];

            // Check if hit the stack at this column
            if (crystal.y >= stackTop - crystal.size) {
                // Land on top of the pile
                const landY = stackTop - crystal.size * 0.5;

                this.groundCrystals.push({
                    x: crystal.x,
                    y: landY,
                    size: crystal.size,
                    color: crystal.color,
                    rotation: crystal.rotation,
                    facets: crystal.facets
                });

                // Update stack height for this column
                this.stackHeights[clampedColumn] += crystal.size * 0.5;

                return false;
            }

            return true;
        });
    }

    drawStar(star) {
        const flicker = Math.sin(this.time * star.flickerSpeed + star.flickerOffset) * 0.5 + 0.5;
        const alpha = star.brightness * flicker * 0.8 + 0.1;

        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fill();
    }

    drawBranch(branch, sway) {
        const swayX = Math.sin(this.time * this.config.swaySpeed + branch.swayOffset) * sway;

        this.ctx.beginPath();
        this.ctx.moveTo(branch.startX, branch.startY);
        this.ctx.lineTo(branch.endX + swayX, branch.endY + swayX * 0.3);
        this.ctx.strokeStyle = '#3d5c47';
        this.ctx.lineWidth = branch.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Draw children with increased sway
        branch.children.forEach(child => {
            const childBranch = {
                ...child,
                startX: branch.endX + swayX,
                startY: branch.endY + swayX * 0.3
            };
            this.drawBranch(childBranch, sway * 1.3);
        });
    }

    drawCrystal(crystal, sway = 0, isHanging = false) {
        this.ctx.save();

        const size = crystal.size;

        if (isHanging) {
            // Hanging crystal - pivot from top, swing with swayAngle
            this.ctx.translate(crystal.x + sway, crystal.y + sway * 0.3);
            this.ctx.rotate(crystal.swayAngle || 0);
            // Draw crystal below the pivot point (hanging)
            this.ctx.translate(0, size);
        } else {
            // Falling or ground crystal - use rotation
            this.ctx.translate(crystal.x + sway, crystal.y + sway * 0.3);
            this.ctx.rotate(crystal.rotation || 0);
        }

        // Main crystal body (hexagonal prism shape)
        this.ctx.beginPath();

        // Draw crystal shape - pointing down when hanging
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.6, -size * 0.3);
        this.ctx.lineTo(size * 0.6, size * 0.3);
        this.ctx.lineTo(0, size);
        this.ctx.lineTo(-size * 0.6, size * 0.3);
        this.ctx.lineTo(-size * 0.6, -size * 0.3);
        this.ctx.closePath();

        // Fill with gradient
        const gradient = this.ctx.createLinearGradient(-size, -size, size, size);
        gradient.addColorStop(0, crystal.color);
        gradient.addColorStop(0.5, this.lightenColor(crystal.color, 30));
        gradient.addColorStop(1, this.darkenColor(crystal.color, 20));

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Add highlight
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.2, -size * 0.7);
        this.ctx.lineTo(size * 0.1, -size * 0.4);
        this.ctx.lineTo(-size * 0.1, -size * 0.2);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();

        this.ctx.restore();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    drawTree() {
        const sway = this.config.swayAmount;

        // Draw trunk with taper
        const trunk = this.tree.trunk;
        const topWidth = trunk.width * 0.6;
        const bottomWidth = trunk.width * 1.3;

        this.ctx.beginPath();
        this.ctx.moveTo(trunk.x - topWidth / 2, trunk.top);
        this.ctx.lineTo(trunk.x + topWidth / 2, trunk.top);
        this.ctx.lineTo(trunk.x + bottomWidth / 2, trunk.bottom);
        this.ctx.lineTo(trunk.x - bottomWidth / 2, trunk.bottom);
        this.ctx.closePath();
        this.ctx.fillStyle = '#3d5c47';
        this.ctx.fill();

        // Draw branches
        this.tree.branches.forEach(branch => this.drawBranch(branch, sway));

        // Draw roots
        this.tree.roots.forEach(root => this.drawRoot(root));
    }

    drawRoot(root) {
        // Draw tapered root using multiple segments
        const segments = 12;
        const cpX = root.cpX || (root.startX + root.endX) / 2;
        const cpY = root.cpY || root.startY + (root.endY - root.startY) * 0.4;
        const startThick = root.startThickness || root.thickness || 10;
        const endThick = root.endThickness || 2;

        // Sample points along the quadratic bezier curve
        const getPoint = (t) => {
            const x = (1-t)*(1-t)*root.startX + 2*(1-t)*t*cpX + t*t*root.endX;
            const y = (1-t)*(1-t)*root.startY + 2*(1-t)*t*cpY + t*t*root.endY;
            return { x, y };
        };

        // Draw segments with decreasing thickness
        for (let i = 0; i < segments; i++) {
            const t1 = i / segments;
            const t2 = (i + 1) / segments;
            const p1 = getPoint(t1);
            const p2 = getPoint(t2);

            // Interpolate thickness
            const thick = startThick + (endThick - startThick) * ((t1 + t2) / 2);

            // Fade opacity as root extends outward
            const opacity = 1 - (t1 * 0.4);

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(61, 92, 71, ${opacity})`;
            this.ctx.lineWidth = thick;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
    }

    drawRootGradient() {
        // Gradient starts below the tree and fades to black
        const gradientStart = this.sceneHeight * 0.25;
        const gradientHeight = this.sceneHeight * 0.75;

        const gradient = this.ctx.createLinearGradient(0, gradientStart, 0, gradientStart + gradientHeight);
        gradient.addColorStop(0, 'rgba(10, 10, 12, 0)');
        gradient.addColorStop(0.2, 'rgba(10, 10, 12, 0.5)');
        gradient.addColorStop(0.5, 'rgba(5, 5, 7, 0.85)');
        gradient.addColorStop(1, 'rgba(2, 2, 3, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, gradientStart, this.width, gradientHeight);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#050507';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply parallax offset (background moves at 0.25x scroll speed)
        const parallaxOffset = -this.scrollY * 0.25;

        this.ctx.save();
        this.ctx.translate(0, parallaxOffset);

        // Draw stars
        this.stars.forEach(star => this.drawStar(star));

        // Draw shooting stars and spaceships (in background)
        this.shootingStars.forEach(star => this.drawShootingStar(star));
        this.spaceships.forEach(ship => this.drawSpaceship(ship));

        // Draw tree
        this.drawTree();

        // Update tree crystal positions and pendulum swing
        this.treeCrystals.forEach(crystal => {
            const crystalSway = Math.sin(this.time * this.config.swaySpeed + crystal.swayOffset) * this.config.swayAmount;
            crystal.x = crystal.baseX + crystalSway;
            crystal.y = crystal.baseY + crystalSway * 0.3;
            // Pendulum swing - crystals swing about their top attachment point
            crystal.swayAngle = Math.sin(this.time * this.config.swaySpeed * 1.5 + crystal.swayOffset) * 0.15;
        });

        // Draw tree crystals (hanging from top)
        this.treeCrystals.forEach(crystal => this.drawCrystal(crystal, 0, true));

        // Draw root gradient overlay (BEFORE falling crystals so they stay visible)
        this.drawRootGradient();

        // Draw falling crystals (AFTER gradient so they don't fade)
        this.fallingCrystals.forEach(crystal => this.drawCrystal(crystal, 0));

        // Draw ground crystals
        this.groundCrystals.forEach(crystal => this.drawCrystal(crystal, 0));

        this.ctx.restore();

        // Draw edge gradients (not affected by parallax)
        const bottomGradient = this.ctx.createLinearGradient(0, this.height * 0.85, 0, this.height);
        bottomGradient.addColorStop(0, 'rgba(5, 5, 7, 0)');
        bottomGradient.addColorStop(1, 'rgba(5, 5, 7, 1)');
        this.ctx.fillStyle = bottomGradient;
        this.ctx.fillRect(0, this.height * 0.85, this.width, this.height * 0.15);
    }

    animate() {
        this.time++;

        // Randomly drop crystals
        if (Math.random() < 0.005 && this.treeCrystals.length > 20) {
            this.dropCrystal();
        }

        // Regenerate crystals periodically
        if (this.time - this.lastCrystalSpawn > this.config.crystalRegenRate / 16) {
            this.regenerateCrystal();
            this.lastCrystalSpawn = this.time;
        }

        // Spawn shooting stars and spaceships occasionally
        if (Math.random() < 0.003) {
            this.spawnShootingStar();
        }
        if (Math.random() < 0.001) {
            this.spawnSpaceship();
        }

        // Update falling crystals
        this.updateFallingCrystals();

        // Update shooting stars and spaceships
        this.updateShootingStars();
        this.updateSpaceships();

        // Draw
        this.draw();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CrystalTreeBackground();
});

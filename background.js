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
        // Tree positioned in scene coordinates - takes up first ~30% of scene
        const trunkTop = this.sceneHeight * 0.04;
        const trunkBottom = this.sceneHeight * 0.22;
        const trunkWidth = Math.min(80, this.width * 0.055);

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

        // Crown center point (where main branches originate)
        const crownCenterY = trunkTop + (trunkBottom - trunkTop) * 0.15;
        const trunkHeight = trunkBottom - trunkTop;

        // Generate branches radiating outward in all directions
        const mainBranchCount = 18;

        for (let i = 0; i < mainBranchCount; i++) {
            // Angle spreads from -160deg to +160deg (not straight down)
            const angleRange = Math.PI * 1.6;
            const baseAngle = -Math.PI / 2 - angleRange / 2 + (i / (mainBranchCount - 1)) * angleRange;
            const angle = baseAngle + (Math.random() - 0.5) * 0.2;

            // Very long branches to fill the viewport width
            const length = this.width * 0.25 + Math.random() * this.width * 0.2;

            // Start point along the trunk
            const startY = crownCenterY + Math.abs(Math.cos(angle)) * trunkHeight * 0.4 + Math.random() * trunkHeight * 0.3;
            const startX = centerX + (Math.random() - 0.5) * trunkWidth * 0.5;

            const endX = startX + Math.cos(angle) * length;
            const endY = startY + Math.sin(angle) * length;

            branches.push({
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY,
                thickness: 10 + Math.random() * 6,
                swayOffset: Math.random() * Math.PI * 2,
                children: this.generateTreeChildren(endX, endY, angle, 4)
            });
        }

        return branches;
    }

    generateTreeChildren(x, y, parentAngle, depth) {
        if (depth <= 0) return [];

        const children = [];
        const count = depth >= 3 ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
            // Branch off at angles relative to parent
            const angleOffset = (Math.random() - 0.5) * 0.9;
            const angle = parentAngle + angleOffset;

            // Longer sub-branches relative to viewport
            const length = (this.width * 0.04 + Math.random() * this.width * 0.06) * (depth / 4);

            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;

            children.push({
                startX: x,
                startY: y,
                endX: endX,
                endY: endY,
                thickness: Math.max(2, depth * 2.2),
                swayOffset: Math.random() * Math.PI * 2,
                children: this.generateTreeChildren(endX, endY, angle, depth - 1)
            });
        }

        return children;
    }

    generateRoots(centerX, treeBottom, trunkWidth) {
        const roots = [];
        const rootCount = 12;

        for (let i = 0; i < rootCount; i++) {
            // Roots spread outward and down
            const baseAngle = (i / rootCount) * Math.PI * 1.4 + Math.PI * 0.3;
            const angle = baseAngle + (Math.random() - 0.5) * 0.3;
            const length = this.width * 0.1 + Math.random() * this.width * 0.15;

            const startX = centerX + (Math.random() - 0.5) * trunkWidth;
            const endX = startX + Math.cos(angle) * length;
            const endY = treeBottom + Math.sin(angle) * length * 0.4 + 40;

            roots.push({
                startX: startX,
                startY: treeBottom,
                endX: endX,
                endY: endY,
                thickness: 6 + Math.random() * 6,
                children: this.generateRootChildren(endX, endY, angle, 2)
            });
        }

        return roots;
    }

    generateRootChildren(x, y, parentAngle, depth) {
        if (depth <= 0) return [];

        const children = [];
        const count = 1 + Math.floor(Math.random() * 2);

        for (let i = 0; i < count; i++) {
            const angleOffset = (Math.random() - 0.5) * 0.6;
            const angle = parentAngle + angleOffset;
            const length = this.width * 0.03 + Math.random() * this.width * 0.05;

            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.abs(Math.sin(angle)) * length * 0.35 + 20;

            children.push({
                startX: x,
                startY: y,
                endX: endX,
                endY: endY,
                thickness: Math.max(2, depth * 2.5),
                children: this.generateRootChildren(endX, endY, angle, depth - 1)
            });
        }

        return children;
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
            size: 8 + Math.random() * 12,
            color: this.config.crystalColors[Math.floor(Math.random() * this.config.crystalColors.length)],
            swayOffset: swayOffset + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2,
            facets: Math.floor(Math.random() * 2) + 5
        };
    }

    createGroundPile() {
        this.groundCrystals = [];
        // Ground pile at the very bottom of the scene (above footer)
        this.groundY = this.sceneHeight * 0.92;
        const pileWidth = this.width * 0.6;
        const pileCenter = this.width / 2;

        // Create initial pile
        for (let i = 0; i < 50; i++) {
            const x = pileCenter + (Math.random() - 0.5) * pileWidth;
            const distFromCenter = Math.abs(x - pileCenter) / (pileWidth / 2);
            const pileHeight = Math.max(0, 1 - distFromCenter);
            const y = this.groundY - pileHeight * 30 * Math.random();

            this.groundCrystals.push({
                x: x,
                y: y,
                size: 5 + Math.random() * 8,
                color: this.config.crystalColors[Math.floor(Math.random() * this.config.crystalColors.length)],
                rotation: Math.random() * Math.PI * 2,
                facets: Math.floor(Math.random() * 2) + 5
            });
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
            rotationSpeed: (Math.random() - 0.5) * 0.1,
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

            // Check if hit ground (at bottom of scene)
            if (crystal.y >= this.groundY - crystal.size) {
                // Add to ground pile
                this.groundCrystals.push({
                    x: crystal.x,
                    y: this.groundY - Math.random() * 20,
                    size: crystal.size,
                    color: crystal.color,
                    rotation: crystal.rotation,
                    facets: crystal.facets
                });
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

    drawCrystal(crystal, sway = 0) {
        this.ctx.save();
        this.ctx.translate(crystal.x + sway, crystal.y + sway * 0.3);
        this.ctx.rotate(crystal.rotation);

        const size = crystal.size;
        const facets = crystal.facets;

        // Main crystal body (hexagonal prism shape)
        this.ctx.beginPath();

        // Draw crystal shape
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
        this.ctx.beginPath();
        this.ctx.moveTo(root.startX, root.startY);

        // Curved root
        const cpX = (root.startX + root.endX) / 2;
        const cpY = root.startY + (root.endY - root.startY) * 0.4;
        this.ctx.quadraticCurveTo(cpX, cpY, root.endX, root.endY);

        this.ctx.strokeStyle = '#3d5c47';
        this.ctx.lineWidth = root.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Draw children
        if (root.children) {
            root.children.forEach(child => this.drawRoot(child));
        }
    }

    drawRootGradient() {
        // Gradient starts below the tree trunk and fades to black
        const groundY = this.height * 0.9;
        const gradientHeight = this.sceneHeight - groundY;

        const gradient = this.ctx.createLinearGradient(0, groundY, 0, groundY + gradientHeight);
        gradient.addColorStop(0, 'rgba(10, 10, 12, 0)');
        gradient.addColorStop(0.3, 'rgba(10, 10, 12, 0.7)');
        gradient.addColorStop(0.7, 'rgba(5, 5, 7, 0.95)');
        gradient.addColorStop(1, 'rgba(2, 2, 3, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, groundY, this.width, gradientHeight);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#050507';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply parallax offset (background moves at 0.5x scroll speed)
        const parallaxOffset = -this.scrollY * 0.5;

        this.ctx.save();
        this.ctx.translate(0, parallaxOffset);

        // Draw stars
        this.stars.forEach(star => this.drawStar(star));

        // Draw tree
        this.drawTree();

        // Update tree crystal positions for sway
        this.treeCrystals.forEach(crystal => {
            const crystalSway = Math.sin(this.time * this.config.swaySpeed + crystal.swayOffset) * this.config.swayAmount;
            crystal.x = crystal.baseX + crystalSway;
            crystal.y = crystal.baseY + crystalSway * 0.3;
        });

        // Draw tree crystals
        this.treeCrystals.forEach(crystal => this.drawCrystal(crystal, 0));

        // Draw falling crystals
        this.fallingCrystals.forEach(crystal => this.drawCrystal(crystal, 0));

        // Draw root gradient overlay
        this.drawRootGradient();

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

        // Update falling crystals
        this.updateFallingCrystals();

        // Draw
        this.draw();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CrystalTreeBackground();
});

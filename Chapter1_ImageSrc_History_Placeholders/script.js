/*=========================
MOUSE LIGHT
=========================*/

const mouseLight = document.querySelector(".mouse-light");

document.addEventListener("mousemove", (e) => {

    mouseLight.style.left = e.clientX + "px";
    mouseLight.style.top = e.clientY + "px";

});

/*=========================
PRESENTATION NAVIGATION
=========================*/

const slides = document.querySelectorAll(".slide");
const progress = document.getElementById("progressDots");
const startBtn = document.querySelector(".start-btn");
const currentSlideEl = document.getElementById("currentSlide");
const totalSlidesEl = document.getElementById("totalSlides");
const chapterEl = document.querySelector(".chapter-number");
const membersOverlay = document.getElementById("membersOverlay");

const slideLabels = Array.from(slides, (slide, i) => {
    if (i === 0) return "CHAPTER 01";
    const eyebrow = slide.querySelector(".slide-eyebrow");
    if (eyebrow) return eyebrow.textContent.replace(/\s+/g, " ").trim();
    return i === slides.length - 1 ? "THANK YOU" : "CHAPTER 01";
});

if (progress) {
    slides.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.className = "dot" + (index === 0 ? " active" : "");
        dot.tabIndex = 0;
        dot.setAttribute("role", "button");
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.addEventListener("click", () => goToSlide(index));
        dot.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goToSlide(index); }
        });
        progress.appendChild(dot);
    });
}

const dots = document.querySelectorAll(".dot");
let current = 0;
const total = slides.length;

function pad(num) { return String(num + 1).padStart(2, "0"); }

function goToSlide(index) {
    if (index < 0 || index >= total) return;
    slides[current].classList.remove("active");
    if (dots[current]) dots[current].classList.remove("active");
    current = index;
    slides[current].classList.add("active");
    if (dots[current]) dots[current].classList.add("active");
    currentSlideEl.textContent = pad(current);
    totalSlidesEl.textContent = String(total).padStart(2, "0");
    if (chapterEl && slideLabels[current]) chapterEl.textContent = slideLabels[current];
}
function nextSlide(){ goToSlide(current + 1); }
function prevSlide(){ goToSlide(current - 1); }
if (startBtn) startBtn.addEventListener("click", nextSlide);
document.addEventListener("keydown", (e) => {
    if (membersOverlay && membersOverlay.classList.contains("open")) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); nextSlide(); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prevSlide(); }
    if (e.key === "Home") { e.preventDefault(); goToSlide(0); }
    if (e.key === "End") { e.preventDefault(); goToSlide(total - 1); }
});
let touchStartX = 0;
document.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; });
document.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
});
goToSlide(0);

/*=========================
INTERACTIVE STRUCTURE DIAGRAMS
(supports unlimited zoom depth,
 works for every .cpu-diagram
 found on the page)
=========================*/

// key -> short explanation shown in the info panel
const componentInfo = {

    // ---- Slide 4: Computer -> CPU -> Control Unit ----
    io: "Moves data between the computer and its external environment — the bridge to peripherals like keyboards, disks, and networks.",
    memory: "Stores both the data and the instructions the CPU works with, while a program is running.",
    cpu: "Controls the operation of the whole computer and performs its data processing. Often just called the \"processor.\" Click it again to see what's inside.",
    registers: "Small, extremely fast storage locations inside the CPU that hold the data the processor is actively working with right now.",
    alu: "The Arithmetic and Logic Unit — the component that actually performs the computer's data processing operations.",
    control: "Directs the operation of the CPU: interprets instructions and orchestrates the ALU, registers, and memory to carry them out. Click it again to see what's inside.",
    sequencing: "Sequencing logic — steps the control unit through its own microinstructions in the right order, driving each phase of an instruction's execution.",
    curegs: "Control unit registers and decoders — hold and decode the current microinstruction so the correct control signals get generated.",
    cumemory: "Control memory — stores the microprogram, the built-in set of microinstructions that define exactly how the control unit carries out each machine instruction.",

    // ---- Slide 5: Motherboard -> Processor Chip -> Core ----
    mbmem: "Chips on the motherboard that hold the computer's main memory, plugged into their own memory slots.",
    mbio: "Chips that manage the flow of data between the motherboard and external devices and peripherals.",
    mbproc: "The processor chip slots into the motherboard's socket. A modern one packs multiple cores on a single chip — a multicore processor. Click it again to zoom in.",
    pccores: "The individual processing units on the chip — this example has eight, arranged around a shared cache. Click to look inside a single core.",
    pcl3: "L3 cache — a large cache shared by every core on the chip, sitting between the cores and main memory to speed up access to frequently used data.",
    coreinstr: "Instruction logic — fetches instructions and decodes them to figure out the operation and where its operands live.",
    corealu: "Performs the data processing operation specified by the instruction being executed.",
    coreload: "Load/store logic — manages the transfer of data to and from main memory by way of the cache.",
    corel1i: "L1 instruction cache — the fastest, closest cache to the core; holds recently used instructions.",
    corel1d: "L1 data cache — the fastest, closest cache to the core; holds recently used data and operands.",
    corel2i: "L2 instruction cache — a second, slightly larger and slower instruction cache layer beneath L1.",
    corel2d: "L2 data cache — a second, slightly larger and slower data cache layer beneath L1."

};

function initDiagram(diagram) {

    const wrap = diagram.closest(".diagram-wrap");
    const infoPanel = wrap ? wrap.querySelector(".info-panel") : null;
    const nodes = diagram.querySelectorAll(".node");
    const backButtons = diagram.querySelectorAll(".back-btn");

    function showView(viewId) {

        diagram.querySelectorAll(".diagram-view").forEach((v) => {
            v.classList.remove("active");
        });

        const target = diagram.querySelector('[data-view="' + viewId + '"]');

        if (target) {
            target.classList.add("active");
        }

    }

    function activateNode(node) {

        const key = node.dataset.info;
        const label = node.dataset.label;

        if (infoPanel && componentInfo[key]) {
            infoPanel.innerHTML =
                "<h4>" + label + "</h4><p>" + componentInfo[key] + "</p>";
        }

        nodes.forEach((n) => n.classList.remove("active-node"));
        node.classList.add("active-node");

        if (node.dataset.zoomTarget) {
            showView(node.dataset.zoomTarget);
        }

    }

    nodes.forEach((node) => {

        node.addEventListener("click", () => activateNode(node));

        node.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activateNode(node);
            }
        });

    });

    backButtons.forEach((btn) => {

        function goBack(e) {
            e.stopPropagation();
            const parentView = btn.closest(".diagram-view").dataset.parent;
            showView(parentView);
        }

        btn.addEventListener("click", goBack);

        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goBack(e);
            }
        });

    });

}

document.querySelectorAll(".cpu-diagram").forEach(initDiagram);

/*=========================
MEMBERS OVERLAY
=========================*/

const membersBtn = document.getElementById("membersBtn");
const membersClose = document.getElementById("membersClose");

function openMembers() {
    if (membersOverlay) membersOverlay.classList.add("open");
}

function closeMembers() {
    if (membersOverlay) membersOverlay.classList.remove("open");
}

if (membersBtn) {
    membersBtn.addEventListener("click", openMembers);
}

if (membersClose) {
    membersClose.addEventListener("click", closeMembers);
}

if (membersOverlay) {

    // click on the dark backdrop (not the panel itself) closes it
    membersOverlay.addEventListener("click", (e) => {
        if (e.target === membersOverlay) {
            closeMembers();
        }
    });

}

// Escape key closes the members overlay
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeMembers();
    }
});

/*=========================
AVENGERS INTERACTIVE PHOTO
(inside the Members overlay)
=========================*/

const avengersInfo = {
    black_widow: "Alex Magpantay Jr. 20 Years Old, From Talisay Batangas, an aspiring data analyst, top ph baxia, love language: matulog, fixerman (tagabuo ng nasirang pamilya) LF single mom yung walang anak",
    nick_fury: "Sean Bismanos, Sto. Tomas Batangas, naghahalimaw pag 10 pm, kung papogian ang usapan, marunong ako mag luto",
    iron_man: "Jayson Litan, 20 Years old, pinanganak kahapon, dog lover (yung luto)",
    hulk: "John Loise Manacop, 20 years old, Nakatira sa ilalim ng tulay",
    cap_america: "John Olever Bregonia, 22 years old, from Sto. Tomas Batangas, batak mag inom, love language: mag beg",
    thor: "Kylle Justin Malapajo, 19 years old, malvar batangas gay mer, love language kumain, sariwang sariwa",
    hawkeye: "Christian Mata, Malvar Batangas ?? years old, top ph selena di sumasala, halimaw sa lahat ng larangan kahit ano pa yan",
};

const avengersFrame = document.getElementById("avengersFrame");
const avengersStage = document.getElementById("avengersStage");
const avengersBack = document.getElementById("avengersBack");
const avengersInfoPanel = document.getElementById("avengersInfo");

if (avengersFrame && avengersStage) {

    const hotspots = avengersFrame.querySelectorAll(".hotspot");

    const ZOOM_SCALE = 2.4;

    function zoomToHotspot(spot) {

        const ox = parseFloat(spot.dataset.ox) / 100;
        const oy = parseFloat(spot.dataset.oy) / 100;
        const key = spot.dataset.info;
        const label = spot.dataset.label;

        const W = avengersStage.offsetWidth;
        const H = avengersStage.offsetHeight;
        const frameW = avengersFrame.offsetWidth;
        const frameH = avengersFrame.offsetHeight;

        const px = ox * W;
        const py = oy * H;

        const tx = (frameW / 2) - ZOOM_SCALE * px;
        const ty = (frameH / 2) - ZOOM_SCALE * py;

        avengersStage.style.transform =
            "translate(" + tx + "px, " + ty + "px) scale(" + ZOOM_SCALE + ")";

        avengersFrame.classList.add("zoomed");

        hotspots.forEach((s) => s.classList.remove("active-hotspot"));
        spot.classList.add("active-hotspot");

        if (avengersInfoPanel && avengersInfo[key]) {
            avengersInfoPanel.innerHTML =
                "<h4>" + label + "</h4><p>" + avengersInfo[key] + "</p>";
        }

    }

    function resetAvengers() {

        avengersFrame.classList.remove("zoomed");
        avengersStage.style.transform = "translate(0px, 0px) scale(1)";
        hotspots.forEach((s) => s.classList.remove("active-hotspot"));

        if (avengersInfoPanel) {
            avengersInfoPanel.innerHTML =
                "<h4>Meet the team</h4><p>Hover to see a glow, click a character to zoom in and read who they are. Each blank face is where a member's photo goes.</p>";
        }

    }

    hotspots.forEach((spot) => {

        spot.addEventListener("click", () => zoomToHotspot(spot));

        spot.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                zoomToHotspot(spot);
            }
        });

    });

    if (avengersBack) {

        avengersBack.addEventListener("click", (e) => {
            e.stopPropagation();
            resetAvengers();
        });

        avengersBack.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                resetAvengers();
            }
        });

    }

    // reset the zoom every time the Members overlay is reopened/closed
    if (membersBtn) {
        membersBtn.addEventListener("click", resetAvengers);
    }

    if (membersClose) {
        membersClose.addEventListener("click", resetAvengers);
    }

}

// Clickable Chapter 1 meanings and Intel processor highlights
const termData = {
    "instruction-set": {title:"Similar or identical instruction set",text:"In many cases, the exact same set of machine instructions is supported on all members of the family. Thus, a program that executes on one machine will also execute on any other. In some cases, the lower end of the family has an instruction set that is a subset of that of the top end of the family. This means that programs can move up but not down."},
    "operating-system": {title:"Similar or identical operating system",text:"The same basic operating system is available for all family members. In some cases, additional features are added to the higher-end members."},
    "speed": {title:"Increasing speed",text:"The rate of instruction execution increases in going from lower to higher family members."},
    "io-ports": {title:"Increasing number of I/O ports",text:"The number of I/O ports increases in going from lower to higher family members."},
    "memory-size": {title:"Increasing memory size",text:"The size of main memory increases in going from lower to higher family members."},
    "cost": {title:"Increasing cost",text:"At a given point in time, the cost of a system increases in going from lower to higher family members."},
    "4004": {title:"Intel 4004",text:"A breakthrough was achieved in 1971, when Intel developed its 4004. The 4004 was the first chip to contain all of the components of a CPU on a single chip: The microprocessor was born. The 4004 can add two 4-bit numbers and can multiply only by repeated addition."},
    "8008": {title:"Intel 8008",text:"The next major step in the evolution of the microprocessor was the introduction in 1972 of the Intel 8008. This was the first 8-bit microprocessor and was almost twice as complex as the 4004."},
    "8080": {title:"Intel 8080",text:"Introduced in 1974, the Intel 8080 was the first general-purpose microprocessor. Whereas the 4004 and the 8008 had been designed for specific applications, the 8080 was designed to be the CPU of a general-purpose microcomputer. It was faster, had a richer instruction set, and had a large addressing capability."},
    "8086": {title:"Intel 8086",text:"A far more powerful, 16-bit machine. In addition to a wider data path and larger registers, the 8086 sported an instruction cache, or queue, that prefetches a few instructions before they are executed. The 8086 is the first appearance of the x86 architecture."},
    "pentium": {title:"Pentium",text:"Superscalar techniques are used to allow multiple instructions to execute in parallel."},
    "pentium-pro": {title:"Pentium Pro",text:"Dynamic execution is introduced, including techniques for improved instruction execution and prediction."},
    "pentium-ii": {title:"Pentium II",text:"Extends the Pentium family with multimedia and performance enhancements."},
    "pentium-iii": {title:"Pentium III",text:"Adds Streaming SIMD Extensions (SSE) to support enhanced multimedia and floating-point performance."},
    "pentium-4": {title:"Pentium 4",text:"Continues the evolution of the Intel x86 family with higher clock rates and architectural enhancements."},
    "core": {title:"Intel Core",text:"A processor family designed for improved performance and energy efficiency, continuing the move toward multicore designs."},
    "core-2": {title:"Intel Core 2",text:"Introduced multicore designs in the Core family, with the Core 2 Duo providing two processing cores on one processor."}
};
window.openTermPopup = function(term){
    const item=termData[term], overlay=document.getElementById('termPopup'), title=document.getElementById('termPopupTitle'), text=document.getElementById('termPopupText');
    if(!item || !overlay || !title || !text) return;
    title.textContent=item.title; text.textContent=item.text; overlay.classList.add('show'); overlay.setAttribute('aria-hidden','false');
};
document.addEventListener('click', function(e){ const btn=e.target.closest('.term-popup-btn'); if(!btn) return; e.preventDefault(); e.stopPropagation(); openTermPopup(btn.dataset.term); }, true);

const popupOverlay=document.getElementById('termPopup'), popupClose=document.getElementById('termPopupClose');
window.closeTermPopup = function(){
    if(!popupOverlay) return;
    popupOverlay.classList.remove('show');
    popupOverlay.setAttribute('aria-hidden','true');
};
// Direct close handler: works even if another document-level click handler exists.
if(popupClose){
    popupClose.onclick = function(e){ e.preventDefault(); e.stopPropagation(); closeTermPopup(); };
    popupClose.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); closeTermPopup(); }, true);
}
if(popupOverlay){
    popupOverlay.addEventListener('click', function(e){
        if(e.target === popupOverlay) closeTermPopup();
    }, true);
}
document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && popupOverlay && popupOverlay.classList.contains('show')) closeTermPopup();
});


/* Blite Food — generated artwork.
 * These are stand-ins for real photography. Every food/equipment <img> points at its real
 * asset path first (assets/img/...); only when that file is missing does it get swapped for
 * one of these illustrations. Drop in photos with the same filenames and they take over.
 */
window.BliteArt = (function () {
  let uid = 0;

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let s = hash(String(seed)) || 1;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const f = (n) => Math.round(n * 10) / 10;
  function inCircle(r, R, cx = 100, cy = 100) {
    const a = r() * Math.PI * 2, d = R * Math.sqrt(r());
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  }

  /* ---------- primitives ---------- */
  function plate(id, kind) {
    if (kind === "bowl") {
      return `<defs><radialGradient id="bw${id}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#3a3a3a"/><stop offset=".7" stop-color="#1b1b1b"/><stop offset="1" stop-color="#0d0d0d"/></radialGradient></defs>
      <circle cx="100" cy="100" r="97" fill="url(#bw${id})"/><circle cx="100" cy="100" r="80" fill="#111"/>`;
    }
    if (kind === "glass") return "";
    return `<defs><radialGradient id="pl${id}" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".78" stop-color="#fbf8f5"/><stop offset="1" stop-color="#e9e2dc"/></radialGradient></defs>
      <circle cx="100" cy="100" r="97" fill="url(#pl${id})"/><circle cx="100" cy="100" r="78" fill="#fff" stroke="#efe8e2" stroke-width="1.2"/>`;
  }
  function grains(r, n, R, palette, rx = 2.6, ry = 1.1) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const [x, y] = inCircle(r, R);
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${rx}" ry="${ry}" fill="${pick(r, palette)}" transform="rotate(${Math.floor(r() * 180)} ${f(x)} ${f(y)})"/>`;
    }
    return s;
  }
  function chunk(r, x, y, size, fill, hi) {
    const pts = [];
    const n = 6 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, d = size * (0.7 + r() * 0.45);
      pts.push(f(x + Math.cos(a) * d) + "," + f(y + Math.sin(a) * d));
    }
    return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${fill}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="${f(x - size * 0.25)}" cy="${f(y - size * 0.3)}" rx="${f(size * 0.35)}" ry="${f(size * 0.18)}" fill="${hi}" opacity=".55" transform="rotate(-25 ${f(x)} ${f(y)})"/>`;
  }
  function chunks(r, n, R, fills, his, size = 9) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const [x, y] = inCircle(r, R);
      s += chunk(r, x, y, size * (0.8 + r() * 0.5), pick(r, fills), pick(r, his));
    }
    return s;
  }
  function leaves(r, n, R, color = "#3f8f3a") {
    let s = "";
    for (let i = 0; i < n; i++) {
      const [x, y] = inCircle(r, R);
      const rot = Math.floor(r() * 360), L = 5 + r() * 4;
      s += `<path d="M${f(x - L)} ${f(y)} Q${f(x)} ${f(y - L * 0.8)} ${f(x + L)} ${f(y)} Q${f(x)} ${f(y + L * 0.8)} ${f(x - L)} ${f(y)}Z" fill="${color}" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;
    }
    return s;
  }
  function rings(r, n, R, color = "#c8102e", size = 4.5, w = 2.4) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const [x, y] = inCircle(r, R);
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(size * (0.8 + r() * 0.4))}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
    }
    return s;
  }
  function dots(r, n, R, palette, size = 1.8) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const [x, y] = inCircle(r, R);
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(size * (0.6 + r() * 0.8))}" fill="${pick(r, palette)}"/>`;
    }
    return s;
  }
  function base(id, R, c1, c2) {
    return `<defs><radialGradient id="bs${id}" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <circle cx="100" cy="100" r="${R}" fill="url(#bs${id})"/>`;
  }
  function liquid(id, c1, c2, R = 78) {
    return `<defs><radialGradient id="lq${id}" cx="42%" cy="38%" r="65%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <circle cx="100" cy="100" r="${R}" fill="url(#lq${id})"/>`;
  }
  function sheen(R = 60) {
    return `<ellipse cx="80" cy="72" rx="${R * 0.45}" ry="${R * 0.16}" fill="#fff" opacity=".13" transform="rotate(-30 80 72)"/>`;
  }

  /* ---------- dishes ---------- */
  const dishes = {
    rice(r, id) {
      return plate(id) + base(id, 66, "#ee6d2a", "#c9431a") +
        grains(r, 520, 64, ["#f07a2e", "#e8622a", "#f59a4a", "#d9491c", "#f7b36b", "#e3571f"]) +
        chunks(r, 5, 48, ["#6b3316", "#7c3d1a", "#5a2a12"], ["#b0602e", "#9c5427"], 10) +
        leaves(r, 7, 58) + rings(r, 5, 55) + rings(r, 3, 55, "#f4efe6", 5, 1.6);
    },
    "fried-rice"(r, id) {
      return plate(id) + base(id, 66, "#f0c35a", "#d9a03a") +
        grains(r, 520, 64, ["#f3c969", "#efb94a", "#f6d98b", "#e9a93a", "#f8e3a6"]) +
        dots(r, 40, 60, ["#6db33f", "#4f9a2c"], 2.2) + dots(r, 30, 60, ["#f08a24", "#e96d1a"], 2) +
        chunks(r, 5, 46, ["#c27a3a", "#b36a2c"], ["#e3a15d"], 10) + chunks(r, 3, 50, ["#5b2616"], ["#8b4a2c"], 5);
    },
    coconut(r, id) {
      return plate(id) + base(id, 66, "#f5e6c6", "#e3cc9f") +
        grains(r, 520, 64, ["#f4e3c1", "#ebd3a6", "#f8ebd2", "#e6c992"]) +
        dots(r, 24, 58, ["#d8261f", "#e24a1f"], 2.2) + chunks(r, 6, 50, ["#f28a5c", "#ee7a4a"], ["#ffc0a0"], 6) + leaves(r, 5, 58);
    },
    noodles(r, id) {
      let s = plate(id) + base(id, 64, "#eab765", "#cf9440");
      for (let i = 0; i < 70; i++) {
        const [x, y] = inCircle(r, 56), [x2, y2] = inCircle(r, 56), [cx, cy] = inCircle(r, 60);
        s += `<path d="M${f(x)} ${f(y)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}" fill="none" stroke="${pick(r, ["#f2c66d", "#e0a948", "#f6d58c", "#d99a3a"])}" stroke-width="3.4" stroke-linecap="round"/>`;
      }
      return s + chunks(r, 6, 48, ["#b8692e", "#a45a26"], ["#e3a15d"], 9) + leaves(r, 10, 56, "#4f9a2c") + dots(r, 20, 56, ["#f08a24", "#d8261f"], 2.2);
    },
    beans(r, id) {
      return plate(id) + base(id, 50, "#9a5530", "#6e3a1f") + dots(r, 260, 48, ["#a45f37", "#8a4b2a", "#6e3a1f", "#b86a3a"], 2.6) +
        `<ellipse cx="86" cy="80" rx="22" ry="8" fill="#e3571f" opacity=".35"/>` + plantainSlices(r, 7, 124, 118, 26);
    },
    "soup-egusi"(r, id) {
      return plate(id, "bowl") + liquid(id, "#d59a36", "#a86a1c") +
        dots(r, 160, 70, ["#f3d68a", "#e9c46a", "#f7e3a8"], 3.2) + leaves(r, 26, 66, "#2f6e2a") + leaves(r, 10, 66, "#4b8f33") +
        chunks(r, 6, 58, ["#6b3316", "#7a3a1a"], ["#a9582a"], 9) + sheen(70);
    },
    "soup-bitterleaf"(r, id) {
      return plate(id, "bowl") + liquid(id, "#9a7a2c", "#5b4a1a") + dots(r, 50, 70, ["#e0802a", "#c9651f"], 3) +
        leaves(r, 60, 68, "#3d5e22") + leaves(r, 20, 68, "#57792c") + chunks(r, 7, 58, ["#5a2a12", "#6b3316", "#3f3a36"], ["#9c5427", "#7a716a"], 9) + sheen(70);
    },
    "soup-okra"(r, id) {
      let s = plate(id, "bowl") + liquid(id, "#79a23a", "#3f6b1f");
      for (let i = 0; i < 26; i++) {
        const [x, y] = inCircle(r, 66); const sz = 5 + r() * 2.5;
        s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz)}" fill="#a9cf6a" stroke="#5f8f2c" stroke-width="1.4"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(sz * 0.35)}" fill="#e8f3cf"/>`;
      }
      for (let i = 0; i < 6; i++) {
        const [x, y] = inCircle(r, 52), rot = Math.floor(r() * 360);
        s += `<path d="M${f(x - 9)} ${f(y)} A9 9 0 1 1 ${f(x + 9)} ${f(y)}" fill="none" stroke="#f08a5c" stroke-width="6" stroke-linecap="round" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;
      }
      return s + chunks(r, 3, 50, ["#e8dccb"], ["#fff"], 8) + sheen(70);
    },
    "soup-ogbono"(r, id) {
      return plate(id, "bowl") + liquid(id, "#8a7a3a", "#4f431c") + dots(r, 80, 70, ["#6e6130", "#a3924a"], 2.6) +
        leaves(r, 18, 66, "#355b22") + chunks(r, 7, 58, ["#5a2a12", "#6b3316"], ["#9c5427"], 9) + sheen(70);
    },
    stew(r, id) {
      return plate(id, "bowl") + liquid(id, "#d23a1e", "#8e1a10") + dots(r, 40, 70, ["#f0562a", "#e8452a"], 4) +
        chunks(r, 9, 56, ["#b0602e", "#9c4d1e", "#c47334"], ["#e8a06a"], 12) + sheen(70);
    },
    "stew-green"(r, id) {
      return plate(id, "bowl") + liquid(id, "#5c7a2a", "#2f4514") + dots(r, 60, 70, ["#7f9d3a", "#a0b85a"], 3.2) +
        chunks(r, 8, 56, ["#5a2a12", "#6b3316"], ["#9c5427"], 10) +
        `<ellipse cx="118" cy="112" rx="12" ry="9" fill="#fff"/><ellipse cx="118" cy="112" rx="5" ry="4.5" fill="#f5b42a"/>` + sheen(70);
    },
    goat(r, id) {
      return plate(id) + base(id, 62, "#a8431c", "#6e2a10") +
        chunks(r, 22, 54, ["#7a3515", "#8e3f18", "#6a2c10", "#a34a1e"], ["#d27a3a", "#c56a30"], 11) +
        rings(r, 8, 56, "#c8102e", 5, 2.6) + rings(r, 5, 56, "#2f8a2a", 5, 2.4) + rings(r, 5, 56, "#f4efe6", 6, 1.6) + dots(r, 30, 56, ["#e63b1f"], 1.6);
    },
    yam(r, id) {
      return plate(id) +
        `<defs><radialGradient id="ym${id}" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#fffef8"/><stop offset=".7" stop-color="#f4ecd8"/><stop offset="1" stop-color="#e2d4b2"/></radialGradient></defs>
        <ellipse cx="86" cy="94" rx="44" ry="40" fill="url(#ym${id})"/><ellipse cx="128" cy="120" rx="30" ry="27" fill="url(#ym${id})"/>
        <ellipse cx="74" cy="80" rx="16" ry="7" fill="#fff" opacity=".8" transform="rotate(-25 74 80)"/><ellipse cx="120" cy="110" rx="10" ry="5" fill="#fff" opacity=".8" transform="rotate(-25 120 110)"/>`;
    },
    plantain(r, id) {
      return plate(id) + plantainSlices(r, 16, 100, 100, 58);
    },
    moimoi(r, id) {
      let s = plate(id);
      const spots = [[76, 82], [124, 84], [100, 126]];
      spots.forEach(([x, y], i) => {
        s += `<defs><radialGradient id="mm${id}${i}" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#e9a066"/><stop offset="1" stop-color="#b8612c"/></radialGradient></defs>
          <rect x="${x - 24}" y="${y - 20}" width="48" height="40" rx="16" fill="url(#mm${id}${i})"/>` + dots(r, 30, 16, ["#c7743a", "#d9884a"], 1.8).replace(/cx="([\d.]+)" cy="([\d.]+)"/g, (m, a, b) => `cx="${f(+a - 100 + x)}" cy="${f(+b - 100 + y)}"`) +
          `<ellipse cx="${x + 4}" cy="${y}" rx="8" ry="6" fill="#fff"/><ellipse cx="${x + 4}" cy="${y}" rx="3.5" ry="3" fill="#f5b42a"/>`;
      });
      return s + leaves(r, 4, 60);
    },
    "fried-yam"(r, id) {
      let s = plate(id);
      for (let i = 0; i < 14; i++) {
        const [x, y] = inCircle(r, 44), rot = Math.floor(r() * 180);
        s += `<rect x="${f(x - 18)}" y="${f(y - 6)}" width="36" height="12" rx="3" fill="${pick(r, ["#f1c45c", "#e8b44a", "#f5d27a"])}" stroke="#c98a2a" stroke-width="1.4" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;
      }
      return s + `<circle cx="146" cy="146" r="20" fill="#fff" stroke="#eee" stroke-width="2"/><circle cx="146" cy="146" r="15" fill="#c8261c"/>` + dots(r, 10, 12, ["#e84a2a"], 1.4).replace(/cx="([\d.]+)" cy="([\d.]+)"/g, (m, a, b) => `cx="${f(+a + 46)}" cy="${f(+b + 46)}"`);
    },
    "meat-pie"(r, id) {
      let s = plate(id);
      const spots = [[72, 82, -35], [128, 82, 35], [72, 124, 145], [128, 124, 215]];
      spots.forEach(([x, y, rot], i) => {
        s += `<g transform="rotate(${rot} ${x} ${y})"><defs><radialGradient id="mp${id}${i}" cx="45%" cy="30%" r="70%"><stop offset="0" stop-color="#f2c27a"/><stop offset="1" stop-color="#c9822f"/></radialGradient></defs>
          <path d="M${x - 26} ${y + 8} A26 26 0 0 1 ${x + 26} ${y + 8} Z" fill="url(#mp${id}${i})"/>`;
        for (let k = 0; k <= 8; k++) {
          const a = Math.PI + (k / 8) * Math.PI;
          s += `<circle cx="${f(x + Math.cos(a) * 25)}" cy="${f(y + 8 + Math.sin(a) * 25)}" r="2.6" fill="#b87428"/>`;
        }
        s += `<ellipse cx="${x - 6}" cy="${y - 4}" rx="9" ry="4" fill="#fff" opacity=".3"/></g>`;
      });
      return s;
    },
    "sausage-roll"(r, id) {
      let s = plate(id);
      for (let i = 0; i < 5; i++) {
        const y = 62 + i * 19, x = 100 + (r() - 0.5) * 10;
        s += `<rect x="${f(x - 42)}" y="${y - 8}" width="84" height="17" rx="8" fill="#e2a553" stroke="#b9762c" stroke-width="1.4"/>
          <path d="M${f(x - 24)} ${y - 6} l6 12 M${f(x - 6)} ${y - 6} l6 12 M${f(x + 12)} ${y - 6} l6 12" stroke="#b9762c" stroke-width="1.6"/>`;
      }
      return s;
    },
    "puff-puff"(r, id) {
      let s = plate(id);
      const pts = [[100, 100], [70, 84], [130, 84], [70, 118], [130, 118], [100, 66], [100, 134], [72, 150], [128, 52], [150, 104], [50, 100]];
      pts.slice(0, 10).forEach(([x, y], i) => {
        const R = 16 + r() * 3;
        s += `<defs><radialGradient id="pp${id}${i}" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#f2c07a"/><stop offset=".7" stop-color="#d98a38"/><stop offset="1" stop-color="#a95c1f"/></radialGradient></defs>
          <circle cx="${f(x + (r() - 0.5) * 6)}" cy="${f(y + (r() - 0.5) * 6)}" r="${f(R)}" fill="url(#pp${id}${i})"/>`;
      });
      return s + dots(r, 120, 64, ["#ffffff", "#fff8ee"], 1.1);
    },
    "spring-roll"(r, id) {
      let s = plate(id);
      for (let i = 0; i < 5; i++) {
        const y = 66 + i * 16, x = 92, rot = -18 + r() * 8;
        s += `<g transform="rotate(${f(rot)} ${x} ${y})"><rect x="${x - 44}" y="${y - 7}" width="88" height="15" rx="7" fill="#d99a48" stroke="#a8641f" stroke-width="1.4"/>
          <ellipse cx="${x + 43}" cy="${y + 0.5}" rx="4" ry="7" fill="#b37030"/></g>`;
      }
      return s + `<circle cx="146" cy="142" r="20" fill="#fff" stroke="#eee" stroke-width="2"/><circle cx="146" cy="142" r="15" fill="#e0452a"/><circle cx="142" cy="138" r="2" fill="#ffbfa0"/>`;
    },
    "chin-chin"(r, id) {
      let s = plate(id);
      for (let i = 0; i < 90; i++) {
        const [x, y] = inCircle(r, 58), rot = Math.floor(r() * 90);
        s += `<rect x="${f(x - 4)}" y="${f(y - 4)}" width="8" height="8" rx="2" fill="${pick(r, ["#e8b057", "#d99a3e", "#f0c273", "#c98630"])}" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;
      }
      return s;
    },
    "drink-zobo"(r, id) { return glass(r, id, "#8e1030", "#4a0616", ["#f08a24", "#6bbf4a"]); },
    "drink-chapman"(r, id) { return glass(r, id, "#e0452a", "#9c1d10", ["#7ec04a", "#f2b233"]); },
  };

  function plantainSlices(r, n, cx, cy, R) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = R * Math.sqrt(r());
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, rot = Math.floor(r() * 180);
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="15" ry="9" fill="${pick(r, ["#f2a93b", "#e8962a", "#f5b84e"])}" stroke="#a8521a" stroke-width="2.2" transform="rotate(${rot} ${f(x)} ${f(y)})"/>
        <ellipse cx="${f(x - 2)}" cy="${f(y - 2)}" rx="6" ry="3" fill="#ffd98a" opacity=".6" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;
    }
    return s;
  }
  function glass(r, id, c1, c2, garnish) {
    let s = `<defs><radialGradient id="gl${id}" cx="40%" cy="38%" r="65%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <circle cx="100" cy="100" r="82" fill="#fff" opacity=".7" stroke="#e7e1dc" stroke-width="3"/><circle cx="100" cy="100" r="72" fill="url(#gl${id})"/>`;
    for (let i = 0; i < 6; i++) {
      const [x, y] = inCircle(r, 44), rot = Math.floor(r() * 90);
      s += `<rect x="${f(x - 11)}" y="${f(y - 11)}" width="22" height="22" rx="5" fill="#fff" opacity=".35" stroke="#fff" stroke-opacity=".6" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;
    }
    s += `<circle cx="128" cy="76" r="20" fill="${garnish[1]}" opacity=".9"/><circle cx="128" cy="76" r="16" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/>
      <path d="M128 60v32M112 76h32M117 65l22 22M139 65l-22 22" stroke="#fff" stroke-width="1" opacity=".5"/>` + leaves(r, 3, 20, garnish[0]);
    return s + `<ellipse cx="74" cy="66" rx="24" ry="8" fill="#fff" opacity=".25" transform="rotate(-35 74 66)"/>`;
  }

  /* ---------- equipment ---------- */
  const steel = (id) => `<defs><linearGradient id="st${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fbfbfb"/><stop offset=".45" stop-color="#cfd3d6"/><stop offset=".55" stop-color="#e9ecee"/><stop offset="1" stop-color="#9aa0a5"/></linearGradient>
    <linearGradient id="gd${id}" x1="0" x2="1"><stop offset="0" stop-color="#b8892f"/><stop offset=".5" stop-color="#f3d27a"/><stop offset="1" stop-color="#a87a25"/></linearGradient></defs>`;
  const equipment = {
    "eq-chafing"(id) {
      return steel(id) + `<ellipse cx="100" cy="162" rx="78" ry="10" fill="#000" opacity=".12"/>
        <path d="M34 150 L46 118 M166 150 L154 118 M60 150 L66 118 M140 150 L134 118" stroke="#8d9398" stroke-width="4" stroke-linecap="round"/>
        <rect x="40" y="104" width="120" height="22" rx="4" fill="url(#st${id})"/>
        <path d="M44 104 Q46 54 100 50 Q154 54 156 104 Z" fill="url(#st${id})"/>
        <rect x="88" y="42" width="24" height="10" rx="5" fill="#2b2b2b"/>
        <ellipse cx="78" cy="72" rx="18" ry="6" fill="#fff" opacity=".7" transform="rotate(-18 78 72)"/>
        <rect x="70" y="140" width="14" height="12" rx="2" fill="#2f5da8"/><rect x="116" y="140" width="14" height="12" rx="2" fill="#2f5da8"/>`;
    },
    "eq-chafing-round"(id) {
      return steel(id) + `<ellipse cx="100" cy="162" rx="64" ry="9" fill="#000" opacity=".12"/>
        <path d="M52 150 L60 116 M148 150 L140 116" stroke="#8d9398" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="100" cy="112" rx="58" ry="14" fill="url(#st${id})"/>
        <path d="M44 110 Q44 50 100 46 Q156 50 156 110 Z" fill="url(#st${id})"/>
        <path d="M44 110 Q44 50 100 46 Q156 50 156 110" fill="none" stroke="url(#gd${id})" stroke-width="3"/>
        <circle cx="100" cy="44" r="7" fill="url(#gd${id})"/><ellipse cx="80" cy="70" rx="16" ry="6" fill="#fff" opacity=".7" transform="rotate(-25 80 70)"/>`;
    },
    "eq-plates"(id) {
      let s = `<ellipse cx="100" cy="160" rx="74" ry="10" fill="#000" opacity=".1"/>`;
      for (let i = 0; i < 7; i++) s += `<ellipse cx="100" cy="${150 - i * 7}" rx="70" ry="20" fill="#fff" stroke="#ddd6d0" stroke-width="1.5"/>`;
      return s + `<ellipse cx="100" cy="108" rx="44" ry="12" fill="none" stroke="#ece6e1" stroke-width="2"/>`;
    },
    "eq-charger"(id) {
      return steel(id) + `<ellipse cx="100" cy="148" rx="80" ry="12" fill="#000" opacity=".1"/>
        <ellipse cx="100" cy="120" rx="80" ry="30" fill="url(#gd${id})"/><ellipse cx="100" cy="116" rx="66" ry="23" fill="#fff" stroke="#e8e1da" stroke-width="1.5"/>
        <ellipse cx="100" cy="114" rx="42" ry="14" fill="none" stroke="#efe9e4" stroke-width="2"/>`;
    },
    "eq-knives"(id) {
      let s = steel(id);
      [-14, 0, 14].forEach((dx, i) => {
        s += `<g transform="rotate(${-28 + i * 6} 100 100)"><rect x="${92 + dx}" y="24" width="14" height="92" rx="7" fill="url(#st${id})" stroke="#a9aeb2" stroke-width="1"/><rect x="${94 + dx}" y="112" width="10" height="64" rx="5" fill="#d7dbde" stroke="#a9aeb2" stroke-width="1"/></g>`;
      });
      return s;
    },
    "eq-cutlery"(id) {
      return steel(id) + `<g transform="rotate(-8 100 100)">
        <rect x="62" y="30" width="12" height="140" rx="6" fill="url(#st${id})" stroke="#a9aeb2"/>
        <path d="M94 30v40q0 10 6 12v88h8V82q6-2 6-12V30h-4v36h-3V30h-4v36h-3V30z" fill="url(#st${id})" stroke="#a9aeb2"/>
        <ellipse cx="140" cy="56" rx="14" ry="24" fill="url(#st${id})" stroke="#a9aeb2"/><rect x="136" y="76" width="8" height="94" rx="4" fill="url(#st${id})" stroke="#a9aeb2"/></g>`;
    },
    "eq-tray"(id) {
      return steel(id) + `<ellipse cx="100" cy="146" rx="84" ry="12" fill="#000" opacity=".1"/>
        <ellipse cx="100" cy="118" rx="84" ry="36" fill="url(#st${id})" stroke="#a9aeb2"/><ellipse cx="100" cy="114" rx="70" ry="27" fill="#e6e9eb"/>
        <ellipse cx="78" cy="104" rx="26" ry="6" fill="#fff" opacity=".7" transform="rotate(-10 78 104)"/>`;
    },
    "eq-table"(id) {
      return `<ellipse cx="100" cy="168" rx="70" ry="9" fill="#000" opacity=".1"/>
        <path d="M24 92 Q24 150 34 162 L166 162 Q176 150 176 92 Z" fill="#fbf8f5" stroke="#e6dfd8"/>
        <ellipse cx="100" cy="90" rx="76" ry="24" fill="#fff" stroke="#e6dfd8"/>
        <path d="M44 104 Q46 140 50 160 M80 112 Q80 140 80 162 M120 112 Q120 140 120 162 M156 104 Q154 140 150 160" stroke="#eee7e1" stroke-width="2" fill="none"/>
        <circle cx="100" cy="84" r="10" fill="#f5223a" opacity=".85"/><circle cx="92" cy="80" r="6" fill="#ff9f0a"/>`;
    },
    "eq-chair"(id) {
      return steel(id) + `<ellipse cx="100" cy="176" rx="46" ry="7" fill="#000" opacity=".1"/>
        <g stroke="url(#gd${id})" stroke-width="6" stroke-linecap="round" fill="none">
        <path d="M68 30 L64 176 M132 30 L136 176 M68 30 L132 30 M66 60 L134 60 M66 84 L134 84 M72 138 L66 176 M128 138 L134 176 M60 150 L140 150"/>
        <path d="M84 30 L82 110 M100 30 L100 110 M116 30 L118 110"/></g>
        <path d="M58 112 Q100 104 142 112 L146 132 Q100 140 54 132 Z" fill="#fff6e6" stroke="#e6d6b8"/>`;
    },
  };

  function svg(inner, cls = "gen", vb = "0 0 200 200") {
    return `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  }

  /** A top-down dish (transparent background). */
  function dish(kind, seed = "") {
    const id = "d" + ++uid;
    if (equipment[kind]) return svg(equipment[kind](id));
    const fn = dishes[kind] || dishes.rice;
    return svg(fn(rng(kind + seed), id));
  }

  /** A dish photographed on a surface (for cards) — fills the box. */
  function scene(kind, seed = "", bg) {
    const id = "s" + ++uid, r = rng("bg" + kind + seed);
    const isEq = !!equipment[kind];
    const surfaces = isEq ? [["#f8f4f1", "#e9e1db"]] : [["#fbe3d6", "#f2c3ab"], ["#f6e7da", "#e7c7a9"], ["#fde6e0", "#f4bfb3"], ["#efe4d6", "#d9c4a6"]];
    const [c1, c2] = bg || pick(r, surfaces);
    const inner = isEq ? equipment[kind](id) : (dishes[kind] || dishes.rice)(rng(kind + seed), id);
    const extra = isEq ? "" :
      `<circle cx="${f(20 + r() * 30)}" cy="${f(20 + r() * 20)}" r="${f(5 + r() * 4)}" fill="#c8102e" opacity=".85"/><path d="M${f(260 + r() * 20)} ${f(180 + r() * 20)} q10 -18 22 -6 q-10 16 -22 6z" fill="#3f8f3a"/>
       <circle cx="${f(250 + r() * 30)}" cy="${f(28 + r() * 20)}" r="3" fill="#6b3316"/><circle cx="${f(262 + r() * 20)}" cy="${f(40 + r() * 16)}" r="2.4" fill="#6b3316"/>`;
    return `<svg class="gen" viewBox="0 0 300 225" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><radialGradient id="sf${id}" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>
      <filter id="sh${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="4" dy="8" stdDeviation="7" flood-color="#3a1408" flood-opacity=".28"/></filter></defs>
      <rect width="300" height="225" fill="url(#sf${id})"/>${extra}
      <g filter="url(#sh${id})" transform="translate(${isEq ? 50 : 42} ${isEq ? 12 : -5}) scale(${isEq ? 1 : 1.18})">${inner}</g></svg>`;
  }

  /** Art-directed photo placeholder (events, kitchen, team) with a caption naming the required shot. */
  function photo(label, seed = "") {
    const r = rng("ph" + label + seed), id = "p" + ++uid;
    const palettes = [
      ["#f7c78b", "#d9793a", "#7b2b18", "#2a100c"],
      ["#f3d9b0", "#c9924f", "#6b3a1f", "#1e120c"],
      ["#ffd3c4", "#e5664f", "#8a1f2a", "#2b0d12"],
      ["#f0e0c8", "#b98b5a", "#5a3a22", "#1a120c"],
    ];
    const p = pick(r, palettes);
    let bokeh = "";
    for (let i = 0; i < 22; i++) {
      bokeh += `<circle cx="${f(r() * 400)}" cy="${f(r() * 170)}" r="${f(6 + r() * 26)}" fill="${pick(r, ["#fff3d6", "#ffd28a", "#ffb36b", "#ffffff"])}" opacity="${f(0.08 + r() * 0.22)}"/>`;
    }
    const tableY = 190 + r() * 20;
    let plates = "";
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 95 + r() * 20;
      plates += `<ellipse cx="${f(x)}" cy="${f(tableY + 24)}" rx="34" ry="10" fill="#fff" opacity=".85"/><ellipse cx="${f(x)}" cy="${f(tableY + 21)}" rx="22" ry="6" fill="${pick(r, ["#e0561e", "#d59a36", "#6e3a1f", "#f2a93b"])}"/>`;
    }
    return `<span class="ph"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="pg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset=".45" stop-color="${p[1]}"/><stop offset=".8" stop-color="${p[2]}"/><stop offset="1" stop-color="${p[3]}"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#pg${id})"/>${bokeh}
      <rect x="-10" y="${f(tableY)}" width="420" height="120" fill="#fff" opacity=".12"/>${plates}</svg>
      <span class="ph__label">📷 ${label}</span></span>`;
  }

  /* ---------- hero garnish ---------- */
  const garnish = {
    chilli: `<svg viewBox="0 0 64 64"><path d="M14 50 C10 34 22 18 40 14 C46 13 50 16 48 20 C36 24 26 34 24 48 C23 54 16 56 14 50Z" fill="#e0192f"/><path d="M44 16 C46 10 52 8 56 10" stroke="#2f7a2a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 40 C24 32 30 26 36 22" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    leaf: `<svg viewBox="0 0 72 72"><path d="M8 62 C8 30 30 8 64 8 C64 40 42 62 8 62Z" fill="#3f8f3a"/><path d="M10 60 C26 44 40 30 60 12" stroke="#2c6a28" stroke-width="2.4" fill="none"/><path d="M24 46 l-4 -12 M34 36 l-2 -14 M44 26 l0 -10 M30 42 l12 2 M40 32 l12 0" stroke="#2c6a28" stroke-width="1.6"/></svg>`,
    pepper: `<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="14" fill="#e8401f"/><path d="M20 8 q2 -6 8 -6" stroke="#2f7a2a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="15" cy="17" rx="4" ry="2.6" fill="#fff" opacity=".45"/></svg>`,
    grain: `<svg viewBox="0 0 26 26"><circle cx="8" cy="8" r="4" fill="#6b3316"/><circle cx="18" cy="12" r="3" fill="#6b3316"/><circle cx="10" cy="19" r="3.4" fill="#8a4a22"/></svg>`,
  };

  return { dish, scene, photo, garnish };
})();

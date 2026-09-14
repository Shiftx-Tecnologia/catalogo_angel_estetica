# 📁 `public/` — Assets estáticos do CAMARIM STORE

Esta pasta é servida na raiz pelo Vite. Qualquer arquivo aqui pode ser referenciado em código como `/products/perfumes/body%20splash.PNG`.

---

## 🗂️ Estrutura real do projeto

```
public/
├── favicon.svg              # Favicon do site
├── opengraph.jpg            # Imagem para OpenGraph/Twitter cards
├── robots.txt               # SEO crawler hints
│
├── branding/                # 🏷️ Identidade visual da marca CAMARIM
│   └── (vazio por enquanto — reserve para logo.svg, logo-mono.svg, og-cover.jpg)
│
├── products/                # 📦 Fotos REAIS de produtos, espelhando as categorias do products.json
│   ├── perfumes/            #   6 imagens (body splash, egeo blue, lattafa fakhar, lattafa musamam, dublin, perfumes.jpg)
│   ├── camisas/             #   5 imagens (4 camisas Brasil + caixa com camisas)
│   ├── roupas/              #   2 imagens (jaqueta cinza, conjunto de 12 peças)
│   ├── acessorios/          #   1 imagem  (acessórios.jpg)
│   ├── presentes/           #   1 imagem  (presentes.jpg)
│   ├── marketing/           #   9 arquivos (logo.png, banners, "em breve", etc — não são produtos)
│   └── todos/               #   Cópia de tudo (parece ser backup — pode remover)
│
└── assets/                  # 🎨 Elementos visuais de estilização
    ├── icons/   (.gitkeep)
    ├── categories/ (.gitkeep)
    ├── patterns/ (.gitkeep)
    └── backgrounds/ (.gitkeep)
```

---

## � Categorias de produto REAIS (de `data/products.json`)

| Categoria    | Ícone                | Produtos atuais |
|--------------|----------------------|-----------------|
| Perfumes     | frasco de perfume    | 5 produtos |
| Camisas      | camiseta             | 5 produtos (4 Brasil + caixa) |
| Roupas       | vestido              | 2 produtos (jaqueta, conjunto) |
| Acessórios   | enfeite / sol        | 1 produto |
| Presentes    | caixa de presente    | 1 produto |

---

## 🔗 Como referenciar

Como os nomes dos arquivos têm **espaços e acentos**, **sempre URL-encode** o nome no `products.json`:

```jsonc
{
  "image": "/products/perfumes/body%20splash.PNG",
  "images": ["/products/perfumes/body%20splash.PNG"]
}
```

Em código React, o navegador já faz o encode do `src` automaticamente:

```tsx
<img src="/products/perfumes/body splash.PNG" alt="Body Splash" />
```

Em CSS, encode o espaço como `%20`:

```css
background-image: url("/products/perfumes/body%20splash.PNG");
```

---

## 📐 Convenções

- **Formato**: como veio do cliente (`.PNG`, `.JPG`, `.MOV`, `.jpg`) — manter como está
- **Tamanho**: comprimir para web antes de subir (`cwebp` ou `squoosh.app`)
- **Nomes com espaço/acento**: manter (cliente já nomeou assim) mas URL-encodar no JSON
- **Tamanho recomendado pra card**: quadrado 800x800 px ou maior (Vite faz o resize)

---

## 🧹 Próximos passos sugeridos

1. **Mover** `marketing/logo.png` → `branding/logo.jpg`
2. **Mover** banners de `marketing/` → `assets/backgrounds/`
3. **Deletar** `products/todos/` (é cópia redundante)
4. **Renomear** arquivos para kebab-case sem acento (opcional): `camisa-brasil-amarela.JPG`, `jaqueta-cinza.PNG`
5. **Comprimir** todas as imagens (`.PNG`/`.JPG` → `.webp`)

⚠️ **Não fiz nada disso automaticamente** — estou esperando sua aprovação antes de mover/deletar.

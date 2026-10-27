# Cloudinary Setup

Este documento descreve a configuração do Cloudinary para o projeto Tunadão.
Necessita do [Cloudinary CLI](https://cloudinary.com/documentation/cloudinary_cli) para criação e pesquisa das imagens e rotinas.

## Estrutura de Pastas

```
tunadao/
├── citadao/          # Posters do Citadão
├── tunas/            # Logos das tunas
├── fotos/            # Fotos gerais (eventos, grupo)
└── logo/             # Logo oficial do Tunadão
```

## Named Transformations

Transformações pré-definidas para consistência:

| Nome            | Transformação                             | Uso                   |
| --------------- | ----------------------------------------- | --------------------- |
| `poster_thumb`  | `w_300,h_450,c_fill,g_auto,q_auto,f_auto` | Thumbnails de posters |
| `poster_medium` | `w_600,h_900,c_limit,q_auto,f_auto`       | Cards/preview         |
| `poster_full`   | `w_1200,h_1800,c_limit,q_auto,f_auto`     | Visualização completa |

### Criar Named Transformations

```bash
cld admin create_transformation poster_thumb "w_300,h_450,c_fill,g_auto,q_auto,f_auto"
cld admin create_transformation poster_medium "w_600,h_900,c_limit,q_auto,f_auto"
cld admin create_transformation poster_full "w_1200,h_1800,c_limit,q_auto,f_auto"
```

### Listar Transformations

```bash
cld admin transformations
```

---

## Uso no Código

### Construir URLs com Transformações

```typescript
const getCloudinaryUrl = (publicId: string, transformation?: string): string => {
  const cloudName = 'tunadao-site';
  const base = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (transformation) {
    return `${base}/t_${transformation}/${publicId}`;
  }
  return `${base}/${publicId}`;
};

// Exemplos
getCloudinaryUrl('tunadao/citadao/citadao-2024-18-poster_s7e7zj', 'poster_thumb');
// → https://res.cloudinary.com/tunadao-site/image/upload/t_poster_thumb/tunadao/citadao/citadao-2024-18-poster_s7e7zj

getCloudinaryUrl('tunadao/tunas/logo-teup_abc123', 'logo_medium');
// → https://res.cloudinary.com/tunadao-site/image/upload/t_logo_medium/tunadao/tunas/logo-teup_abc123
```

### Transformações Inline (alternativa)

Se preferires não usar named transformations:

```typescript
const getCloudinaryUrlInline = (
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string }
): string => {
  const cloudName = 'tunadao-site';
  const transforms = [];

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  transforms.push('f_auto'); // formato automático (webp/avif)

  const transformStr = transforms.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
};
```

---

## Integração de Novos Assets

Exemplo: Logos das Tunas.

1. **Criar named transformations para logos:**

```bash
cld admin create_transformation logo_thumb "w_100,h_100,c_fit,q_auto,f_auto"
cld admin create_transformation logo_medium "w_200,h_200,c_fit,q_auto,f_auto"
cld admin create_transformation logo_full "w_400,h_400,c_fit,q_auto,f_auto"
```

2. **Criar upload preset:**

```bash
cld admin create_upload_preset name=tunadao_logos \
  unsigned=true \
  folder=tunadao/tunas \
  use_filename=true \
  unique_filename=true \
  allowed_formats=jpg,jpeg,png,webp,svg \
  transformation='[{"width":400,"height":400,"crop":"fit","quality":"auto"}]' \
  eager='w_100,h_100,c_fit,q_auto,f_auto|w_200,h_200,c_fit,q_auto,f_auto'
```

3. **Upload:**

```bash
for f in /path/to/logos/*.{png,jpg,svg}; do
  cld upload "$f" upload_preset=tunadao_logos
done
```

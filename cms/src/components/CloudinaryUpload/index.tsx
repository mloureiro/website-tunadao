'use client';

import { useField } from '@payloadcms/ui';
import { useCallback, useSyncExternalStore } from 'react';
import type { TextFieldClientProps } from 'payload';
import './styles.scss';

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
}

interface CloudinaryWidget {
  open: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: object,
        callback: (
          error: Error | null,
          result: { event: string; info: CloudinaryUploadResult }
        ) => void
      ) => CloudinaryWidget;
    };
  }
}

const WIDGET_SCRIPT_SRC = 'https://upload-widget.cloudinary.com/latest/global/all.js';

const subscribeToWidgetScript = (onLoad: () => void): (() => void) => {
  if (window.cloudinary) return () => {};
  let script = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT_SRC}"]`);
  if (!script) {
    script = document.createElement('script');
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }
  script.addEventListener('load', onLoad);
  return () => script.removeEventListener('load', onLoad);
};

export const CloudinaryUploadField: React.FC<TextFieldClientProps> = ({ field, path }) => {
  const { value, setValue } = useField<CloudinaryUploadResult | null>({ path });
  const isWidgetLoaded = useSyncExternalStore(
    subscribeToWidgetScript,
    () => Boolean(window.cloudinary),
    () => false
  );

  const openWidget = useCallback(() => {
    if (!window.cloudinary) return;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        folder: 'tunadao',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFileSize: 10485760,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf'],
        cropping: true,
        croppingAspectRatio: undefined,
        showSkipCropButton: true,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1',
          },
        },
      },
      (error: Error | null, result: { event: string; info: CloudinaryUploadResult }) => {
        if (!error && result && result.event === 'success') {
          const { public_id, secure_url, width, height, format, bytes, resource_type } =
            result.info;
          setValue({
            public_id,
            secure_url,
            width,
            height,
            format,
            bytes,
            resource_type,
          });
        }
      }
    );

    widget.open();
  }, [setValue]);

  const handleRemove = useCallback(() => {
    setValue(null);
  }, [setValue]);

  const label = field?.label || 'Cloudinary Upload';
  const required = field?.required;

  return (
    <div className="cloudinary-upload-field">
      <label className="field-label">
        {typeof label === 'string' ? label : 'Upload'}
        {required && <span className="required">*</span>}
      </label>

      {value?.secure_url ? (
        <div className="cloudinary-preview">
          {value.resource_type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element -- CMS admin preview, next/image unnecessary
            <img src={value.secure_url} alt="Preview" />
          ) : (
            <div className="file-preview">
              <span>{value.format?.toUpperCase()}</span>
              <a href={value.secure_url} target="_blank" rel="noopener noreferrer">
                Ver ficheiro
              </a>
            </div>
          )}
          <div className="preview-info">
            {value.width && value.height && (
              <span>
                {value.width} x {value.height}
              </span>
            )}
            <span>{value.format}</span>
          </div>
          <div className="preview-actions">
            <button type="button" onClick={openWidget} disabled={!isWidgetLoaded}>
              Substituir
            </button>
            <button type="button" onClick={handleRemove} className="remove">
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="cloudinary-dropzone"
          onClick={openWidget}
          disabled={!isWidgetLoaded}
        >
          {isWidgetLoaded ? (
            <>
              <span className="icon">📁</span>
              <span>Clica para fazer upload</span>
              <span className="hint">ou arrasta ficheiros para aqui</span>
            </>
          ) : (
            <span>A carregar...</span>
          )}
        </button>
      )}
    </div>
  );
};

export default CloudinaryUploadField;

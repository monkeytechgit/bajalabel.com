/**
 * BajaLabel - Formulario de Cotización con Supabase
 * Maneja el envío de solicitudes de cotización a la base de datos
 */

// Configuración de Supabase
const SUPABASE_URL = 'https://aehamjwplupnldjectiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlaGFtandwbHVwbmxkamVjdGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTg2NjAsImV4cCI6MjA4MzczNDY2MH0.j28YUN5bE7NWe7DLUfkZ62Y_aUvQ79n0xuixCAvtQKk';

// Cliente de Supabase (simplificado sin SDK)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async insert(table, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let payload;
      try {
        payload = await response.json();
      } catch (_) {
        payload = await response.text();
      }

      const details = payload && typeof payload === 'object'
        ? [payload.message, payload.details, payload.hint, payload.code].filter(Boolean).join(' | ')
        : String(payload);

      throw new Error(`Supabase insert falló (${response.status} ${response.statusText}): ${details || 'Error al guardar los datos'}`);
    }

    return await response.json();
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Manejo del formulario
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cotizacion-form');
  const modal = document.getElementById('cotizacion-modal');
  const openModalBtns = document.querySelectorAll('.open-cotizacion-modal');
  const closeModalBtn = document.querySelector('.modal-close');
  const submitBtn = form?.querySelector('button[type="submit"]');

  // Abrir modal
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Cerrar modal
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeModalBtn?.addEventListener('click', closeModal);

  // Cerrar al hacer clic fuera del modal
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Validación de teléfono
  const phoneInput = document.getElementById('telefono');
  phoneInput?.addEventListener('input', (e) => {
    // Permitir solo números, espacios, guiones y paréntesis
    e.target.value = e.target.value.replace(/[^\d\s\-\(\)\+]/g, '');
  });

  // Validación de email
  const emailInput = document.getElementById('correo');
  emailInput?.addEventListener('blur', (e) => {
    const email = e.target.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
      e.target.setCustomValidity('Por favor ingresa un correo válido');
    } else {
      e.target.setCustomValidity('');
    }
  });

  // Envío del formulario
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Deshabilitar botón de envío
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // Recopilar datos del formulario
      const formData = new FormData(form);
      const data = {
        nombre_completo: formData.get('nombre_completo'),
        correo: formData.get('correo'),
        telefono: formData.get('telefono'),
        empresa: formData.get('empresa') || null,
        tipo_material: formData.get('tipo_material') || null,
        cantidad_estimada: formData.get('cantidad_estimada') || null,
        fecha_entrega: formData.get('fecha_entrega') || null,
        descripcion_proyecto: formData.get('descripcion_proyecto') || null
      };

      // Enviar a Supabase
      await supabase.insert('contacto_webpage', data);

      // Mostrar mensaje de éxito
      showMessage('¡Cotización enviada con éxito! Nos pondremos en contacto contigo pronto.', 'success');
      
      // Limpiar formulario
      form.reset();
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        closeModal();
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      showMessage('Hubo un error al enviar tu cotización. Por favor intenta nuevamente o contáctanos por WhatsApp.', 'error');
    } finally {
      // Rehabilitar botón
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Solicitud';
    }
  });

  // Función para mostrar mensajes
  function showMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';

    // Ocultar después de 5 segundos
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
});

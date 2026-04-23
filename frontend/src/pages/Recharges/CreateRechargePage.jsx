import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rechargeService } from '../../services';
import { GameOperator, RechargeType, GameOperatorLabels, RechargeTypeLabels, DiamondPackages, PBCardPackage } from '../../constants/enums';
import { toast } from 'react-toastify';
import './RechargesPage.css';

export const CreateRechargePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Formulario, 2: Comprobante
  const [formData, setFormData] = useState({
    operator: GameOperator.FREE_FIRE,
    type: RechargeType.DIAMONDS,
    package: null,
    phone_number: '',
    amount: '',
  });
  const [proofData, setProofData] = useState({
    currency: 'USDT',
    payment_method: '',
    proof_image: null,
    transaction_id: '',
  });

  // Calcular la comisión (50%) y el total
  const calculateFee = () => {
    const amount = parseFloat(formData.amount) || 0;
    return (amount * 0.5).toFixed(2);
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const fee = parseFloat(calculateFee());
    return (amount + fee).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Cuando cambia el tipo, auto-seleccionar paquete si es PB_CARD
      if (value === RechargeType.PB_CARD) {
        setFormData({ 
          ...formData, 
          [name]: value,
          package: 'PB_CARD',
          amount: PBCardPackage.priceWithFee.toString()
        });
      } else {
        setFormData({ 
          ...formData, 
          [name]: value,
          package: null,
          amount: ''
        });
      }
    } else if (name === 'package' && formData.type === RechargeType.DIAMONDS) {
      const selectedPackage = DiamondPackages[value];
      const priceWithFee = (selectedPackage.price * 1.5).toFixed(2);
      setFormData({
        ...formData,
        package: value,
        amount: priceWithFee
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone_number || !formData.amount) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    // Ir al paso 2 (comprobante)
    setStep(2);
  };

  const handleProofChange = (e) => {
    const { name, value } = e.target;
    setProofData({ ...proofData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofData({ ...proofData, proof_image: file });
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();

    if (!proofData.currency || !proofData.payment_method || !proofData.proof_image || !proofData.transaction_id) {
      toast.error('Por favor completa todos los campos del comprobante');
      return;
    }

    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Crear FormData para enviar con imagen
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', user.uuid);
      formDataToSend.append('operator', formData.operator);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('package', formData.package || '');
      formDataToSend.append('currency', proofData.currency);
      formDataToSend.append('payment_method', proofData.payment_method);
      formDataToSend.append('transaction_id', proofData.transaction_id);
      formDataToSend.append('proof_image', proofData.proof_image);

      console.log('📤 Enviando recarga con comprobante');
      await rechargeService.createWithFile(formDataToSend);
      toast.success('¡Recarga enviada para verificación!');
      
      setTimeout(() => {
        navigate('/recharges');
      }, 1500);
    } catch (error) {
      console.error('Error al crear recarga:', error);
      toast.error(error.response?.data?.message || 'Error al crear la recarga');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recharges-page">
      <div className="recharges-container">
        <div className="page-header">
          <h1>{step === 1 ? 'Nueva Recarga' : 'Comprobante de Pago'}</h1>
          <button className="btn-back" onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')}>
            {step === 2 ? '← Atrás' : '← Volver'}
          </button>
        </div>

        {step === 1 ? (
          // PASO 1: Formulario de Recarga
          <form className="recharge-form" onSubmit={handleSubmit}>
            {/* Juego: Solo Free Fire */}
            <div className="form-group">
              <label>Juego</label>
              <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '8px', fontWeight: '500', color: '#333' }}>
                {GameOperatorLabels[GameOperator.FREE_FIRE]}
              </div>
            </div>

            {/* Tipo de Compra */}
            <div className="form-group">
              <label htmlFor="type">Tipo de Compra</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value={RechargeType.DIAMONDS}>Diamantes</option>
                <option value={RechargeType.PB_CARD}>Tarjeta PB</option>
              </select>
            </div>

            {/* Paquete de Diamantes */}
            {formData.type === RechargeType.DIAMONDS && (
              <div className="form-group">
                <label htmlFor="package">Paquete de Diamantes</label>
                <select
                  id="package"
                  name="package"
                  value={formData.package || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un paquete</option>
                  {Object.entries(DiamondPackages).map(([key, pkg]) => {
                    const priceWithFee = (pkg.price * 1.5).toFixed(2);
                    return (
                      <option key={key} value={key}>
                        {pkg.label} - ${priceWithFee}
                      </option>
                    );
                  })}
                </select>
                {formData.package && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
                    <small style={{ color: '#333' }}>
                      <strong>Diamantes:</strong> {DiamondPackages[formData.package].total}
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* Tarjeta PB */}
            {formData.type === RechargeType.PB_CARD && (
              <div className="form-group">
                <label>Paquete de Tarjeta PB</label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '8px', fontWeight: '500', color: '#333' }}>
                  {PBCardPackage.label} - ${PBCardPackage.priceWithFee}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="phone_number">Número Telefónico / ID del Jugador</label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Ingresa tu teléfono o ID de jugador"
                pattern="^[a-zA-Z0-9+\-\s]{5,}$"
                title="ID debe tener mínimo 5 caracteres (números, letras, +, - o espacios)"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={isLoading || !formData.package}
            >
              {isLoading ? 'Procesando...' : 'Siguiente'}
            </button>
          </form>
        ) : (
          // PASO 2: Comprobante de Pago
          <form className="recharge-form" onSubmit={handleProofSubmit}>
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: '500' }}>Resumen:</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>{GameOperatorLabels[GameOperator.FREE_FIRE]} - {RechargeTypeLabels[formData.type]}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Monto a pagar: ${formData.amount}</strong></p>
            </div>

            <div className="form-group">
              <label htmlFor="currency">Moneda de Pago</label>
              <select
                id="currency"
                name="currency"
                value={proofData.currency}
                onChange={handleProofChange}
                required
              >
                <option value="USDT">USDT</option>
                <option value="PAYPAL">PayPal</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="payment_method">Método de Pago</label>
              <input
                type="text"
                id="payment_method"
                name="payment_method"
                value={proofData.payment_method}
                onChange={handleProofChange}
                placeholder="Ej: Binance, MetaMask, PayPal Direct"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="transaction_id">ID de Transacción</label>
              <input
                type="text"
                id="transaction_id"
                name="transaction_id"
                value={proofData.transaction_id}
                onChange={handleProofChange}
                placeholder="Ej: 0x123abc456def..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="proof_image">Comprobante (Imagen)</label>
              <input
                type="file"
                id="proof_image"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {proofData.proof_image && (
                <p style={{ color: '#4CAF50', marginTop: '8px', fontSize: '14px' }}>
                  ✓ Archivo seleccionado: {proofData.proof_image.name}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Recarga'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

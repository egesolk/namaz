export function ErrorPage() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '40px'
      }}>
        <div style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: '20px',
          lineHeight: '1'
        }}>
          503
        </div>
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '10px'
        }}>
          Sunucu Bulunamadı
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Şu anda sunucu erişilemez durumdadır. Lütfen daha sonra tekrar deneyin.
        </p>
        
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#991b1b'
        }}>
          Bağlantı kurulamıyor. Ağ bağlantınızı kontrol edin.
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#dc2626',
            color: '#fff',
            border: 'none',
            padding: '12px 30px',
            fontSize: '16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        >
          Yenile
        </button>
      </div>
    </div>
  );
}

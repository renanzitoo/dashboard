// Script de Teste de Conexão Realtime
// Execute este arquivo no console do navegador (F12) para testar a conexão

console.log('🧪 Iniciando teste de conexão Realtime...\n')

// 1. Teste de criação do cliente
try {
  const { createClient } = await import('./src/lib/supabase/client.js')
  const supabase = createClient()
  console.log('✅ Cliente Supabase criado com sucesso')
  
  // 2. Teste de conexão básica
  const testChannel = supabase
    .channel('test-connection')
    .subscribe((status) => {
      console.log('📡 Status do canal de teste:', status)
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Conexão Realtime funcionando!')
        console.log('\n🎉 SUCESSO! O Realtime está configurado corretamente.')
        console.log('\nAgora teste fazendo uma inserção no banco:')
        console.log('1. Acesse o SQL Editor do Supabase')
        console.log('2. Execute: INSERT INTO customers (name, email) VALUES (\'Teste\', \'teste@test.com\');')
        console.log('3. Veja se aparece automaticamente na página\n')
        
        // Limpar teste
        setTimeout(() => {
          supabase.removeChannel(testChannel)
          console.log('🧹 Canal de teste removido')
        }, 3000)
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.error('❌ Falha na conexão Realtime!')
        console.error('Status:', status)
        console.error('\n🔍 Possíveis causas:')
        console.error('1. Realtime não habilitado no Supabase (execute enable-realtime.sql)')
        console.error('2. Problema de rede/firewall bloqueando WebSockets')
        console.error('3. Credenciais do Supabase incorretas no .env.local')
      }
    })
  
  // 3. Teste de escuta em uma tabela real
  console.log('\n🔍 Configurando escuta na tabela customers...')
  const customersChannel = supabase
    .channel('test-customers')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'customers' },
      (payload) => {
        console.log('🔄 Mudança detectada na tabela customers:', payload)
      }
    )
    .subscribe((status) => {
      console.log('📡 Status da escuta em customers:', status)
    })
  
  // Aguardar 5 segundos para os testes
  setTimeout(() => {
    console.log('\n📊 Resumo do teste:')
    console.log('- Canais ativos:', supabase.getChannels().map(ch => ch.topic))
    console.log('\n💡 Dica: Deixe este teste rodando e faça uma inserção no SQL Editor')
  }, 5000)
  
} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error)
  console.error('\n🔍 Verifique se:')
  console.error('1. As variáveis de ambiente estão corretas no .env.local')
  console.error('2. O servidor Next.js está rodando (npm run dev)')
  console.error('3. Você está acessando a página correta do dashboard')
}

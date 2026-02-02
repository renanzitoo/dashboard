export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5E5F2] via-[#72C1F2] to-[#4E98D9] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <div className="container mx-auto px-6 py-16 flex-1">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Oxyon AI
            </h1>
            <p className="text-xl text-white/90">
              Transformando o atendimento ao cliente com inteligência artificial
            </p>
          </div>

          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Nossa História
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Em um mundo onde cada segundo conta e cada cliente merece atenção especial, 
                nasceu a <span className="font-semibold text-[#4E98D9]">Oxyon AI</span>. 
                Percebemos que muitas empresas lutavam para oferecer um atendimento rápido, 
                eficiente e personalizado 24 horas por dia, 7 dias por semana.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                O Que Fazemos
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Criamos <span className="font-semibold text-[#4E98D9]">agentes de atendimento inteligentes </span> 
                que revolucionam a forma como sua empresa se comunica com os clientes. 
                Nossos agentes de IA não são apenas chatbots – são assistentes verdadeiramente 
                inteligentes que entendem contexto, aprendem com cada interação e oferecem 
                respostas humanizadas.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#D5E5F2] to-[#72C1F2] dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    🤖 Atendimento Inteligente
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">
                    Agentes que compreendem as necessidades dos seus clientes e respondem 
                    com precisão e empatia.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-[#72C1F2] to-[#4E98D9] dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    ⚡ Disponibilidade Total
                  </h3>
                  <p className="text-white/90">
                    Seu negócio nunca dorme. Nossos agentes estão sempre prontos para 
                    atender, a qualquer hora do dia ou da noite.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-[#4E98D9] to-[#566D8C] dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    📊 Insights Valiosos
                  </h3>
                  <p className="text-white/90">
                    Transformamos cada conversa em dados acionáveis para melhorar 
                    continuamente seu serviço.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-[#566D8C] to-[#4E98D9] dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    🎯 Personalização Total
                  </h3>
                  <p className="text-white/90">
                    Cada agente é treinado especificamente para o seu negócio, 
                    falando a língua da sua marca.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Nossa Missão
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Acreditamos que tecnologia deve aproximar pessoas, não afastá-las. 
                Nossa missão é empoderar empresas de todos os tamanhos com ferramentas 
                de IA que elevam a experiência do cliente a um novo patamar, mantendo 
                o toque humano que faz toda a diferença.
              </p>
            </section>

            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Vamos Conversar?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Pronto para transformar seu atendimento ao cliente? 
                Nossa equipe está pronta para entender suas necessidades e criar 
                uma solução personalizada para o seu negócio.
              </p>
              
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <a
                  href="https://wa.me/5535997446030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-sm opacity-90">Felipe</div>
                    <div className="font-bold">+55 35 9744-6030</div>
                  </div>
                </a>
                
                <a
                  href="https://wa.me/5535987113073"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-sm opacity-90">Renan</div>
                    <div className="font-bold">+55 35 98711-3073</div>
                  </div>
                </a>
              </div>
              
              <a
                href="/dashboard-service"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#72C1F2] to-[#4E98D9] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao Dashboard
              </a>
            </section>
          </div>

          
          <div className="mt-auto pt-8 pb-4 text-center">
            <p className="text-white/60 text-xs">
              © {new Date().getFullYear()} Oxyon AI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

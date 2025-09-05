# Use a imagem oficial do RabbitMQ como base
FROM rabbitmq:3-management

# Instale plugins adicionais, se necessário
# Este exemplo habilita o plugin de gerenciamento, que já vem na imagem,
# mas você poderia habilitar outros, como o Shovel ou Federation.
# RUN rabbitmq-plugins enable rabbitmq_management
const kafka = require('kafkajs');

const kafkaClient = new kafka.Kafka({
    brokers: ['localhost:9092'],
    clientId: 'certificate',
})

const topic = 'issue-certificate'
const consumer = kafkaClient.consumer({ groupId: 'certificate-group' })

const producer = kafkaClient.producer();

async function run() {
    await consumer.connect()
    await consumer.subscribe({ topic })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
            console.log(`- ${prefix} ${message.key}#${message.value}`)

            const payload = JSON.parse(message.value);

            // setTimeout(() => {
            producer.send({
                topic: 'certification-response',
                messages: [
                    { value: `Certificado do usuário ${payload.user.name} do curso ${payload.course} gerado!` }
                ]
            })
            // }, 3000);
        },
    })
}

run().catch(console.error)
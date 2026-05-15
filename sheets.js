const https = require('https')

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL
const BOT_NAME = process.env.BOT_NAME

const followRedirects = (url, depth = 0) => {
    return new Promise((resolve, reject) => {
        if (depth > 5) return reject(new Error('Too many redirects'))

        const urlObj = new URL(url)
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: { 'User-Agent': 'Node.js' },
        }

        https.get(options, (res) => {
            console.log(`[sheets] status: ${res.statusCode}, location: ${res.headers.location || '-'}`)

            if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
                res.resume()
                return followRedirects(res.headers.location, depth + 1).then(resolve).catch(reject)
            }

            let data = ''
            res.on('data', (chunk) => { data += chunk })
            res.on('end', () => {
                console.log('[sheets] response:', data.slice(0, 200))
                resolve(data)
            })
        }).on('error', reject)
    })
}

const addLead = (leadId) => {
    const params = `leadId=${encodeURIComponent(leadId)}&botName=${encodeURIComponent(BOT_NAME)}`
    const url = APPS_SCRIPT_URL + '?' + params
    console.log('[sheets] calling:', url)
    return followRedirects(url)
}

module.exports = { addLead }
module.exports = {
    // Secret key for signing JWTs. KEEP THIS SECRET!
    // In a real application, load this from environment variables (e.g., process.env.JWT_SECRET)
    secret: 'f419c650e12588b13b151b235c0ca13eaefcb77a60c2dd466c7726d69f25ab5c7b3741b00bf30d9e0e1075b9e5700ad55d3a1117f03e673f8159cb0f26cbfdaa',

    // How long the token is valid for (e.g., '1h' = 1 hour, '7d' = 7 days, '30m' = 30 minutes)
    expiresIn: '1h'
};
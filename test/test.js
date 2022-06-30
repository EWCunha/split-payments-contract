const SplitPayment = artifacts.require("SplitPayment")

contract("SplitPayment", (accounts) => {
    let splitPayment = null
    beforeEach(async () => {
        splitPayment = await SplitPayment.new(accounts[0])
    })

    it("should split payment", async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]]
        const amounts = [40, 20, 30]
        const initialBalances = await Promise.all(recipients.map(recipient => {
            return web3.eth.getBalance(recipient)
        }))

        await splitPayment.send(
            recipients,
            amounts,
            { from: accounts[0], value: 90 }
        )

        const finalBalances = await Promise.all(recipients.map(recipient => {
            return web3.eth.getBalance(recipient)
        }))

        recipients.forEach((_item, i) => {
            const finalBalance = web3.utils.toBN(finalBalances[i])
            const initalBalance = web3.utils.toBN(initialBalances[i])

            assert(finalBalance.sub(initalBalance).toNumber() === amounts[i])
        })
    })

    it("should NOT split payment if array length mismatch", async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]]
        const amounts = [40, 20]
        try {
            await splitPayment.send(
                recipients,
                amounts,
                { from: accounts[0], value: 90 }
            )
        } catch (e) {
            assert(e.message.includes("_to and _amount arrays must have the same length"))
            return
        }
        assert(false)
    })

    it("should NOT split payment of msg.sender is not owner", async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]]
        const amounts = [40, 20, 30]
        try {
            await splitPayment.send(
                recipients,
                amounts,
                { from: accounts[4], value: 90 }
            )
        } catch (e) {
            assert(e.message.includes("only owner can send transfers"))
            return
        }
        assert(false)
    })
})
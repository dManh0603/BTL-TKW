$(function () {
    const $cartQuantity = $('#cart-quantity');
    const $addToCart = $('.btn-add-to-cart');
    const $itemQuantities = $('.item-quantity');
    $addToCart.click(ev => {
        ev.preventDefault();
        const $this = $(ev.target);
        const id = $this.closest('.product-item').data('key');
        let amount = $('#inputQuantity').val();
        console.log(id);
        console.log(amount)
        if (!amount) {
            amount = 1
        }
        console.log(amount)

        $.ajax({
            method: 'POST',
            url: $this.attr('href'),
            data: { id, amount },
            success: function () {
                console.log('Add to cart successful', arguments)
                $cartQuantity.text(parseInt($cartQuantity.text() || 0) + parseInt(amount))
                alert(amount + ' item added to your cart');
            }
        });
    });

    $itemQuantities.change(ev => {
        const $this = $(ev.target);
        let $tr = $this.closest('tr');
        const $td = $this.closest('td');
        const id = $tr.data('id');
        $.ajax({
            method: 'post',
            url: $tr.data('url'),
            data: { id, quantity: $this.val() },
            success: function (result) {
                console.log(result);
                $cartQuantity.text(result.totalQuantity);
                $td.next().text(result.totalCost);
            }
        })
    });
})
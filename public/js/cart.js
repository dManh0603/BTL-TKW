$(function () {
    const $cartQuantity = $('#cart-quantity');
    const $deleteBtn = $('.delete-btn');
    const $itemQuantities = $('.item-quantity');

    function updateTotalQuantity() {
        const $itemQuantities = $('.item-quantity');
        let total = 0;
        $itemQuantities.each(function () {
            total += parseInt($(this).val()) || 0;
        });
        return $cartQuantity.text(total)
    }

    $itemQuantities.change(updateTotalQuantity);

    $deleteBtn.click(e => {
        e.preventDefault()
        console.log(1)
        $this = $(e.target);
        $this.closest('tr').remove()
        updateTotalQuantity()
    })
})
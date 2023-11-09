$(function () {
    const $createCommentForm = $('.create-comment-form');
    const $commentsWrapper = $('#comment-wrapper');
    const $commentCount = $('#comment-count');
    const $popularItems = $('#popular-items');
    // const $input = $createCommentForm.find('textarea');

    $popularItems.click(ev => {
        ev.preventDefault();
        const $this = $(ev.target);
        const key = $this.closest('button').val();
        console.log(key);
        if (key) {
            $.ajax({
                method: 'POST',
                url: $this.closest('button').attr('href'),
                data: key,
                success: function (res) {
                    console.log(res)
                }
            })
        }
    })


    initCommentForm($createCommentForm, false, false,
        () => {
            resetForm();
        },
        () => {
            $.ajax({
                method: $createCommentForm.attr('method'),
                url: $createCommentForm.attr('action'),
                data: $createCommentForm.serializeArray(),
                success: function (res) {
                    if (res.success) {
                        const $pinnedComment = $commentsWrapper.find('.pinned-comment');
                        const $tmp = $(res.comment);
                        if ($pinnedComment.length) {
                            $tmp.insertAfter($pinnedComment);
                        } else {
                            $commentsWrapper.prepend($tmp);
                        }

                        resetForm();
                        $commentCount.text(parseInt($commentCount.text()) + 1);
                        initComment($tmp);
                    } else {
                        const commentErrors = res.errors.comment;
                        if (commentErrors) {
                            const $errorSection = $(".comment-errors").first();
                            console.log('errorSection:', $errorSection)
                            $errorSection.text(commentErrors[0]);
                            setTimeout(() => {
                                $errorSection.empty();
                            }, 3000)

                            // const $error = $('<small class="text-danger">');
                            // $error.html(commentErrors[0]);
                            // $error.insertAfter($createCommentForm.find('.form-control'));
                        }
                    }
                }
            })
        });

    initComments();

    function resetForm() {
        const $input = $createCommentForm.find('textarea');
        $input.val('').text($input.attr('placeholder')).attr('rows', '1');
        $input.closest('.create-comment').removeClass('focused');
    }

    function initCommentForm($form, placeholder = false,
        btnSaveText = false,
        cancelCb = false,
        submitCb = false) {
        const $cancel = $form.find('.btn-cancel');
        const $save = $form.find('.btn-save');
        const $input = $form.find('textarea');

        $input.text($input.attr('placeholder'));

        if (placeholder) {
            $input.attr('placeholder', placeholder);
        }
        if (btnSaveText) {
            $save.text(btnSaveText);
        }

        $input.click((ev) => {
            $input
                .text('')
                .attr('rows', '3')
                .closest('.create-comment').addClass('focused');
        });

        $cancel.click((ev) => {
            ev.preventDefault()
            if (cancelCb && typeof cancelCb === 'function') {
                cancelCb();
            }
        });

        $form.submit(ev => {
            ev.preventDefault();
            if (submitCb && typeof submitCb === 'function') {
                submitCb();
            }
        });


    }

    function onDeleteClick(ev) {
        debugger
        ev.preventDefault();
        const $delete = $(ev.target);
        if (confirm('Are you sure you want to delete that comment ?')) {
            debugger
            $.ajax({
                method: 'post',
                url: $delete.attr('href'),
                success: function (res) {
                    if (res.success) {
                        console.log(res);
                        $delete.closest('.comment-item').remove();
                        $commentCount.text(parseInt($commentCount.text()) - 1);
                    }
                }
            });
        }
    }

    function initComment($comment) {
        const $delete = $comment.find('.delete-comment-action')
        const $edit = $comment.find('.edit-comment-action')
        const $pin = $comment.find('.pin-comment-action')
        const $cancel = $comment.find('.btn-cancel')
        const $form = $comment.find('.comment-edit-section')
        const $textWrapper = $comment.find('.text-wrapper');
        const $input = $comment.find('textarea');
        const $reply = $comment.find('.btn-reply')
        const $replySection = $comment.find('.reply-section');
        const $username = $comment.find('.username');
        const $subCommentSection = $comment.find('.sub-comments');
        const $viewSubComments = $comment.find('.view-sub-comments');
        let replyFormDisplayed = false;
        let commentsLoaded = false;
        let commentsCollapsed = true;
        let mentionedUsername = null;

        $pin.on('click', onCommentPin);

        $delete.on('click', onDeleteClick);

        $edit.on('click', ev => {
            ev.preventDefault();
            $comment.addClass('edit');
            $input.val($textWrapper.text().trim());
        });

        $cancel.on('click', ev => {
            mentionedUsername = null;
            $comment.removeClass('edit');
        });

        $viewSubComments.on('click', loadSubComments)


        $form.on('submit', onEditFormSubmit);

        $reply.on('click', onReplyClick);

        function onCommentPin(ev) {
            ev.preventDefault();

            const pinned = $pin.data('pinned');

            if (pinned) {
                if (!confirm("Are you sure to unpin this comment ?")) {
                    return;
                }
            } else {
                if (!confirm("You are about to pin the comment. Your previous pinned comment will be unpinned, are you sure ?")) {
                    return;
                }
            }


            $.ajax({
                method: 'post',
                url: $pin.attr('href'),
                success: (res) => {
                    if (res.success) {
                        $comment.remove();
                        $commentsWrapper.find('.pinned-text').remove();
                        $commentsWrapper.prepend(res.comment);
                        const $firstComment = $commentsWrapper.find('.comment-item').eq(0);
                        initComment($firstComment);
                    }
                }
            });
        }

        function loadSubComments(ev) {
            ev.preventDefault();
            const $caret = $viewSubComments.closest('.mb-3').find('i');
            $caret.toggleClass('fa-caret-down fa-caret-up')
            commentsCollapsed = !commentsCollapsed;
            if (commentsCollapsed) {
                $subCommentSection.css('display', 'none');
            } else {
                $subCommentSection.css('display', 'block');
            }

            if (commentsLoaded) {
                return;
            }
            $.ajax({
                url: $viewSubComments.attr('href'),
                success: (res) => {
                    console.log(res);
                    if (res.success) {
                        commentsLoaded = true;
                        $subCommentSection.append(res.comments);
                        const $subComments = $subCommentSection.find('.comment-item');
                        $subComments.each((ind, comment) => {
                            initComment($(comment));
                        })
                    }
                }
            })
        }

        function onEditFormSubmit(ev) {
            debugger
            ev.preventDefault();
            $.ajax({
                method: $form.attr('method'),
                url: $form.attr('action'),
                data: $form.serializeArray(),
                success: function (res) {
                    if (res.success) {
                        $comment.removeClass('edit');
                        $textWrapper.text($input.val());
                        const $div = $('<div>');
                        $div.html(res.comment);
                        const $newComment = $div.find('>div');
                        $comment.replaceWith($newComment);
                        initComment($newComment);
                    }
                }
            })
        }

        function onReplyClick(ev) {
            const isParentComment = !$comment.data('parent-id');
            if (replyFormDisplayed) {
                return;
            }
            const $newForm = $createCommentForm.clone();
            $replySection.append($newForm);
            const $input = $newForm.find('textarea');
            replyFormDisplayed = true;

            if (!isParentComment) {
                mentionedUsername = $username.text();
                $input.val('@' + mentionedUsername + ' ');
                $input[0].focus();
            }

            $input.click(ev => {
                ev.stopImmediatePropagation();
                $input
                    .text('')
                    .attr('rows', '3')
                    .closest('.create-comment').addClass('focused');
            });
            initCommentForm(
                $newForm,
                'Add a reply ...',
                'Reply',
                () => {
                    $newForm.remove();
                    replyFormDisplayed = false;
                },
                () => {
                    const comment = $input.val();
                    if (comment.indexOf('@' + mentionedUsername) !== 0) {
                        mentionedUsername = null;
                    }
                    $.ajax({
                        method: 'post',
                        url: $reply.data('action'),
                        data: {
                            comment: comment,
                            mention: mentionedUsername,
                            parent_id: $reply.closest('.comment-item').data('id')
                        },
                        success: (res) => {
                            if (res.success) {
                                $newForm.remove();
                                replyFormDisplayed = false;
                                let $parentSubCommentSection = $subCommentSection;
                                if ($comment.closest('.sub-comments').length) {
                                    $parentSubCommentSection = $comment.closest('.sub-comments');
                                }
                                $parentSubCommentSection.append(res.comment);
                                const $newComment = $parentSubCommentSection.find('>.comment-item').last();
                                initComment($newComment);

                                $commentCount.text(parseInt($commentCount.text()) + 1);

                            } else {
                                const commentErrors = res.errors.comment;
                                if (commentErrors) {
                                    const $error = $('<small class="text-danger">');
                                    $error.html(commentErrors[0]);
                                    $error.insertAfter($input);
                                }
                            }
                        },
                    })
                }
            )
        }
    }


    function initComments() {
        const $comments = $('.comment-item');
        $comments.each((ind, comment) => {
            const $comment = $(comment);
            initComment($comment);
        });
    }

});
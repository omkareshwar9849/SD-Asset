/**
 * @date 22-02-2024
 * @author imshawan <hello@imshawan.dev>
 * 
 * @class SocraticDialogue
 * @description Represents the SocraticDialogue asset.
 */

class SocraticDialogue {
    /**    
     * Creates an instance of SocraticDialogue.
     * @constructor
     * @param {object} params - The parameters for initializing the SocraticDialogue asset.
     * @param {HTMLElement} params.target - The HTML element to which the SocraticDialogue asset will be attached.
     * @param {boolean} [params.requiresValidation=false] - Whether the SocraticDialogue asset requires validation.
     * @param {object} [params.with={}] - Data associated with the SocraticDialogue asset.
     * @param {boolean} [params.strictMode=false] - Whether the SocraticDialogue asset operates in strict mode.
     * @param {string} [params.header='SocraticDialogue asset'] - The header text for the SocraticDialogue asset.
     * @param {string} [params.action] - Either of 'create', 'answer' or 'reader'
     * @param {string[]} [params.classes] - Optional. An array of CSS classes to add to the SocraticDialogue asset.
     * @param {boolean} [params.noAction=false] - Whether the SocraticDialogue asset has no action.
     * @param {boolean} [params.hideHeader=false] - Whether to hide the header of the SocraticDialogue asset.
     * @param {Array<object>} {params.reactionConfig} - The array of reaction required for reacting
     * @param {Array<object>} {params.spotterReactions} - reactions for spotting insight
     * @param {number} {params.minReflectionChars} - Minimum required characters for sharing a insight spotter reflection
     */
    constructor(params) {
        /**
         * The HTML element to which the SocraticDialogue asset is attached.
         * @type {HTMLElement}
         */
        this.target = params.target;

        /**
         * Whether the SocraticDialogue asset requires validation.
         * @type {boolean}
         */
        this.requiresValidation = params.requiresValidation || false;

        /**
         * Additional data associated with the SocraticDialogue asset.
         * @type {object}
         */
        this.with = params.with || {};

        /**
         * Whether the SocraticDialogue asset operates in strict mode.
         * @type {boolean}
         */
        this.strictMode = params.strictMode || false;

        /**
         * The header text for the SocraticDialogue asset.
         * @type {string}
         */
        this.header = params.header || 'Socratic Dialogue';

        /**
         * A valid action for the SocraticDialogue asset ('create', 'answer' or 'reader').
         * @type {string}
         */
        this.action = params.action || '';

        /**
         * An array of CSS classes to add to the SocraticDialogue asset.
         * @type {string[]}
         */
        this.classes = params.classes || '';

        /**
         * Whether the SocraticDialogue asset has to be read-only.
         * @type {boolean}
         */
        this.noAction = params.noAction || false;

        /**
         * Whether to hide the header of the SocraticDialogue asset.
         * @type {boolean}
         */
        this.hideHeader = params.hideHeader || false;

        /**
         * The array of reaction required for reacting
         * @type {Array<object>}
         */
        this.reactionConfig = params.reactionConfig || [];

        /**
         * Array of reactions for spotting insight
         * @type {Array<object>}
         */
        this.spotterReactions = params.spotterReactions || [];

        /**
         * The available modes for the SocraticDialogue asset.
         * @type {string[]}
         */
        this.modes = ['create', 'answer', 'reader'];

        /**
         * Minimum required characters for sharing a reflection via insight spotter
         * @type {number}
         */
        this.minReflectionChars = params.minReflectionChars || 25;

        /**
         * The parent container for carousel
         * @type {string}
         */
        this.carouselContainerId = 'carousel-outer';

        /**
         * Styles for the active cell.
         * @type {object}
         */
        this.activeQuestionStyles = {
            backgroundColor: '#cbf4fc',
            padding: '2px',
        };

        /**
         * The ID of the current question.
         * @type {string}
         */
        this.currentQuestionId = '';

        /**
         * Stores the ID of the current question paragraph.
         * @type {string}
         */
        this.currentParagraphId = '';

        this.requiresReflection = undefined;
        this.insightCategory = undefined;
        this.insightIconValue = undefined;

        this.initialize(this.target);
    }

    initialize(target) {
        this.initializeActiveElements();

        this.id = this.unique("sdlms-sd-asset-");
        const $that = this;

        if (!target) {
            throw new Error('A valid HTML element is required for the asset to initialize');
        }

        if (!$that.action) {
            $that.log('action is required!');
            throw new Error('action is required!');
        }

        if (!$that.modes.includes($that.action)) {
            $that.log(`Invalid mode: '${$that.action}'`);
            throw new Error(`Invalid mode: '${$that.action}'`);
        }

        this.builder(this.target);
    }

    initializeActiveElements() {
        if (!this.hasData()) {
            return;
        }
        let activeParagraph = null, paragraphIndex = 0;

        for (const paragraph of this.with.questionParagraphs) {
            if (paragraph.isActive) {
                activeParagraph = paragraph;
                break;
            }
            paragraphIndex++;
        }

        if (!activeParagraph) {
            activeParagraph = this.with.questionParagraphs[0];
            paragraphIndex = 0;

            this.with.questionParagraphs[0]['isActive'] = true;
        }

        if (activeParagraph && activeParagraph.questions) {
            let activeQuestion = activeParagraph.questions.find(question => question.isActive);
            if (!activeQuestion && activeParagraph.questions.length) {
                this.with.questionParagraphs[paragraphIndex]['questions'][0]['isActive'] = true;
            }
        }
    }

    /**
    * @function log
    * @description Logs the data to the console
    * @param {String} log 
    */
    log(log) {
        !this.log || console.log(log);
    }

    /**
     * @function unique
     * @description Generates a unique id
     * @param {String} prefix 
     * @returns String
     */

    unique(prefix = "") {
        var dt = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        return prefix + uuid;
    }

    hasData() {
        if (!Object.keys(this.with).length) {
            return false;
        }

        let { questionParagraphs } = this.with || {};
        return (!!questionParagraphs || !!Array.isArray(questionParagraphs) || !!questionParagraphs.length);
    }

    handleParagraphEndEvent() {
        const $target = this.$builder;
        const { currentParagraphId } = this;
        const { questionParagraphs } = this.with || {};

        let currentParagraph = questionParagraphs.find(para => para.id === currentParagraphId);
        let { questions } = currentParagraph;

        let lastQuestion = questions[questions.length - 1];
        let reactionArea = $target.find(`[data-reaction-card="${currentParagraph.id}"]`);
        let imageArea = $target.find(`[data-paragraph-image="${currentParagraph.id}"]`);

        if (this.currentQuestionId == lastQuestion.id) {
            reactionArea.show();
            imageArea.removeClass('d-flex');
        } else {
            reactionArea.hide();
            if (!imageArea.hasClass('d-flex')) {
                imageArea.addClass('d-flex');
            }
        }
    }

    updateInsightData(paragraphId, insightCategory, reflection) {
        if (!this.hasData()) {
            return;
        }

        const paragraphIndex = this.with.questionParagraphs.findIndex(para => para.id == paragraphId);

        this.with.questionParagraphs[paragraphIndex]['insight'] = {
            category: insightCategory,
            content: reflection,
            value: this.insightIconValue
        }
    }

    resolveIndexByAction(action, operand1, operand2) {
        switch (action) {
            case 'next':
                return operand1 + operand2;
            case 'prev':
                return operand1 - operand2;

            default:
                return NaN;
        }
    }

    navigateSection(nav = 'next') {
        this.$builder.find('#' + this.carouselContainerId).carousel(nav);
    }

    navigateToPreviousSection() {
        this.navigateSection('prev');
    }

    navigateToNextSection() {
        this.navigateSection('next');
    }

    navigateQuestionWithData(type = 'next') {
        const $that = this;
        const $target = this.$builder;
        let { currentQuestionId, currentParagraphId } = this;
        let { questionParagraphs } = this.with || {};
        let currentQuestion = null, currentQuestionIndex = -1, forceNext = false;

        if (type == 'force-next') {
            type = 'next';
            forceNext = true;
        }

        if (!$that.hasData()) {
            return;
        }

        const currentParagraphIndex = questionParagraphs.findIndex(q => q.id == currentParagraphId);
        if (currentParagraphIndex == -1) {
            return;
        }

        const currentParagraph = questionParagraphs[currentParagraphIndex];
        if (currentParagraph) {
            currentQuestionIndex = (currentParagraph.questions || []).findIndex(item => item.id == currentQuestionId);
            currentQuestion = currentParagraph.questions[currentQuestionIndex];
        }

        if (currentQuestion && Object.keys(currentQuestion).length) {
            let { id } = currentQuestion;
            let requiredQuestion = null;
            requiredQuestion = currentParagraph.questions[$that.resolveIndexByAction(type, currentQuestionIndex, 1)];

            if (requiredQuestion) {
                $that.currentQuestionId = requiredQuestion.id;
                $that.currentParagraphId = currentParagraph.id;

                $target.find('#' + id).attr('style', null);
                $target.find('#' + requiredQuestion.id).attr('style', null).css($that.activeQuestionStyles);

            } else {
                if (type == 'next' && !forceNext) {
                    let reflection = $target.find(`[data-reflection-area="${currentParagraph.id}"] textarea`).val();
                    if ($that.insightCategory === undefined) {
                        return alert('Spot an insight before proceeding.')
                    }
                    if ($that.requiresReflection === undefined || $that.requiresReflection) {
                        if (!String(reflection).trim().length || !reflection.length > $that.minReflectionChars) {
                            return alert('Please complete writing reflection before proceeding.');
                        }
                    }

                    $that.updateInsightData(currentParagraph.id, $that.insightCategory, reflection);
                }

                let requiredParagraph = null;
                requiredQuestion = null;

                requiredParagraph = questionParagraphs[$that.resolveIndexByAction(type, currentParagraphIndex, 1)];
                if (!requiredParagraph) {
                    return;
                }

                let questionsLength = type == 'prev' ? requiredParagraph.questions.length : -1;

                requiredQuestion = requiredParagraph.questions[$that.resolveIndexByAction(type, questionsLength, 1)];
                if (!requiredQuestion) {
                    return;
                }

                if ($that.stepper && typeof $that.stepper[type] === 'function') {
                    $that.stepper[type]();
                } else {
                    $target.find('#' + $that.carouselContainerId).carousel(type);
                }

                $that.currentParagraphId = requiredParagraph.id;
                $that.currentQuestionId = requiredQuestion.id;

                $target.find('#' + requiredQuestion.id).attr('style', null).css($that.activeQuestionStyles);
            }

            $that.insightCategory = undefined;
            $that.requiresReflection = undefined;
            $that.insightIconValue = undefined
        }

        $that.handleParagraphEndEvent();
    }

    /**
     * @description Components required for the asset to function.
     */
    components() {
        const $that = this;
        return {
            create: function (type = '', id = '', classes = '') {
                return $('<div>', { class: type + ' ' + classes, id });
            },
            title: function (text) {
                return this.create('row').append(
                    this.create('col-12 text-center').append($('<h4>').text(text))
                )
            },
            image: function (url, id) {
                if (!url) return;
                return this.create('d-flex d-none justify-content-center mx-0').attr('data-paragraph-image', id).append(
                    this.create('col-auto').append($('<img>').css({ height: '200px', borderRadius: '10px' }).attr('src', url))
                );
            },
            question: function (data) {
                let styles = {};
                if (data.isActive) {
                    styles = $that.activeQuestionStyles;
                    $that.currentQuestionId = data.id;
                }

                return $('<span>', { id: data.id, class: 'mr-1' }).attr({
                    'data-paragraph-id': data.paragraphId,
                    'data-question-id': data.id,
                }).css(styles).text(data.question);
            },
            navigationIcon: function (params, action = 'prev') {
                let icon = 'arrow-' + (action === 'prev' ? 'up' : 'down');
                let classes = action == 'prev' ? '' : ' justify-content-end';

                return this.create("row", '', 'mx-0 my-3' + classes).append(
                    this.create('d-flex p-2').css({ height: '35px', width: '35px', borderRadius: '100%', backgroundColor: '#E7EFFF' }).append(
                        $('<i>', { class: 'fa fa-' + icon }).attr({
                            'data-paragraph-id': params.id,
                            'data-arrow': '',
                            'data-arrow-action': action
                        }).css({ cursor: 'pointer' })
                    )
                );
            },
            insightIcons: function (spotterReactions, paragraphId, selected = false) {
                let reactionElements = spotterReactions.map((reaction, i) => (
                    $('<button>', { class: 'bg-transparent p-1 border-0' }).attr({
                        'data-value': reaction.value,
                        'data-name': reaction.name,
                        'data-icon': reaction.icon,
                        'data-spotter-icon': '',
                        'data-description': reaction.description,
                        'data-paragraph-id': paragraphId,
                    }).append(this.create('btn-inner d-flex flex-column justify-content-center align-items-center' + (!i ? 'btn-primary' : 'btn-light'))
                        .css({ borderRadius: '100%', height: '100px', width: '100px' })
                        .append(this.create().text(reaction.icon).css({ fontSize: 'x-large', marginTop: '-8px' }),
                            this.create().text(reaction.name).css({ fontSize: 'x-small' })))
                ));

                return this.create('col-7 row justify-content-center mx-0 mb-4').css({ borderRadius: '32px' }).append(reactionElements);
            },
            insightDescription: function (reaction) {
                $that.insightIconValue = reaction.value;

                return this.create('border h-100 mx-0').css({ borderRadius: '20px' }).append(
                    this.create('col pt-2 pb-3 px-0 text-center border-bottom').append(
                        this.create().text(reaction.icon).css({ fontSize: '110px' }),
                        this.create('font-weight-500').text(reaction.name)
                    ),
                    this.create('col p-4 my-auto').append(reaction.description).css({ fontSize: 'smaller' }),
                );
            },
            insightSpotter: function (params) {
                let { id } = params; // Paragraph object
                let { spotterReactions } = $that;
                let firstReaction = spotterReactions[0];
                let btnStyles = { width: '120px', borderRadius: '20px', fontSize: 'small', fontWeight: '500' };

                return this.create('w-100 bg-white position-absolute').attr({ 'data-reflection-area': id }).css({ top: 0, display: 'none', left: 0, overflow: "auto" }).append(
                    this.create('row').append(
                        this.insightIcons(spotterReactions, id),
                        this.create('col-5 mb-4').attr('insight-description', id).append(this.insightDescription(firstReaction))
                    ),
                    this.create('row mx-0 mb-4').append(
                        this.create('col-10').append(
                            $('<textarea>', { rows: 3, class: 'w-100 p-2 mr-2', placeholder: 'Write your insight here...' }).css({ borderRadius: '10px', height: '100px', resize: 'none', fontSize: 'small' })
                        ),
                        this.create('col-2 p-0 px-0 d-flex border').css({ height: '100px', borderRadius: '10px' }).append(
                            $('<button>', { class: 'border-0 btn mx-auto p-0 w-100 btn-outline-primary reactions' }).css({ height: '100px' }).attr({
                                'data-paragraph-id': id,
                                'data-arrow': '',
                                'data-arrow-action': 'force-next',
                            }).append(
                                this.create('').append(
                                    $('<img>').css({ height: '75px' })
                                        .attr('src', 'https://media.giphy.com/media/SqYhwWASzIrjjq07u8/giphy.gif?cid=790b7611q8h8bdz3606mg25v0tps5dm0mur4lqema4rov9ch&ep=v1_stickers_search&rid=giphy.gif&ct=e'),
                                    this.create('font-weight-500').css({ fontSize: 'medium' }).text('Pass')
                                )
                            )
                        )
                    ),
                    this.create('row mx-0').attr({ 'data-ref-nav': id }).append(
                        this.create('hidden-elem row mx-0 pr-0 col justify-content-between').css({ display: 'none' }).append(
                            $('<button>', { class: 'btn btn-secondary' }).css(btnStyles).attr({
                                'data-paragraph-id': id,
                                'data-arrow': '',
                                'data-arrow-action': 'prev',
                                'data-force-prev': ''
                            }).text('Previous'),
                            $('<button>', { class: 'px-3 btn btn-primary' }).css(btnStyles).attr({
                                'data-paragraph-id': id,
                                'data-arrow': '',
                                'data-arrow-action': 'next'
                            }).text('Next')
                        ),
                    )
                )
            },
            reactionSection: function (params) {
                let { reactionConfig } = $that;
                let { id } = params;
                let component = this;

                if (reactionConfig.length) {
                    let iconElements = [];

                    $.each(reactionConfig, function (i, item) {
                        let { category, icon, requiresReflection } = item;
                        let elem = $('<button>', { class: 'btn btn-outline-primary border-0 reactions', title: category })
                            .attr({ 'data-paragraph-id': id, 'data-requires-reflection': requiresReflection, 'data-insight-category': category })
                            .append(
                                component.create().append(
                                    $(icon).css({ height: '75px' }),
                                    component.create('font-weight-500').css({ fontSize: 'medium' }).text(item.category),
                                )
                            )

                        iconElements.push(elem);
                    });

                    return this.create('m-4').attr({ 'data-reaction-card': id }).css({ display: 'none' })
                        .append(this.create('card-body p-2 d-flex justify-content-between').append(iconElements))
                }
            },
            inputTitle: function (title, id) {
                id = id || $that.unique();

                return this.create('mb-3').append(
                    $('<lable>', { class: 'form-label', for: id }).text('Enter title'),
                    $('<input>', { class: 'form-control', id }).val(title)
                )
            },
            inputImage: function (id) {
                id = id || $that.unique();

                return this.create('mb-3').append(
                    $('<lable>', { class: 'form-label', for: id }).text('Enter Image URL'),
                    $('<input>', { class: 'form-control', type:'file', id })
                )
            },
            paragraphBlock(params = {}) {
                console.log(params);
                return this.create().append(
                    this.create('col').append(
                        this.inputTitle(params.title, params.id),
                        this.inputImage( params.id)
                    )
                )
            }
        }
    }

    builder(target = 'body') {
        const $that = this, $target = $(target);
        $target.append(
            $("<sdlms-sd-asset-builder>")
                .attr({
                    id: $that.id,
                    class: ($that.noAction ? "sdlms-readonly" : '') + ' position-relative w-100 h-100' + $that.classes
                })
                .append(`<div class="sdlms-section-header position-relative shadow-none d-${this.hideHeader ? 'none' : 'flex'} primary-header align-items-center justify-content-between enquiry-form-header">
                    <div class="font-weight-bold sdlms-text-white-20px my-auto">${$that.header}</div>`)
                .append($(`<div>`).attr({
                    id: "element-" + $that.id,
                    class: 'create needs-validation position-relative',
                })
                )
        );

        let $builder = $(`#element-${$that.id}`);
        $that.$builder = $builder;
        $that[$that.action == 'answer' ? 'answer' : ($that.action == 'reader' ? 'reader' : 'create')]($that.with);

    }

    attachGlobalEvents() {
        const $that = this;
        const $target = $that.$builder, components = this.components();

        // For previous and next navigations in a question paragraph
        $target.on('click', '[data-arrow]', function () {
            const { arrowAction } = $(this).data();
            if (arrowAction == 'force-next' && !confirm('Are you sure to skip writing the reflection?')) {
                return;
            }

            $that.navigateQuestionWithData(arrowAction);
        });

        // For insight spotter reactions
        $target.on('click', '[data-insight-category]', function () {
            const { insightCategory, paragraphId, requiresReflection } = $(this).data();

            $that.requiresReflection = requiresReflection;
            $that.insightCategory = insightCategory;

            let reflectionTextarea = $target.find(`[data-reflection-area="${paragraphId}"]`);
            if (requiresReflection) {
                reflectionTextarea.show();
            } else {
                reflectionTextarea.hide();
                $that.navigateQuestionWithData('next');
            }
        });

        $target.on('click', '[data-spotter-icon]', function () {
            let data = $(this).data();
            let { paragraphId } = data;

            $.each($(this).parent().parent(), function (i, e) {
                e = $(e).find('div.btn-inner');
                if (e.length) {
                    e.removeClass('btn-primary').addClass('btn-light');
                }
            });

            $(this).find('div.btn-inner').removeClass('btn-light').addClass('btn-primary');

            $target.find(`[insight-description="${paragraphId}"]`).empty().append(
                components.insightDescription(data, paragraphId, true)
            )
        });

        $target.on('keyup', '[data-reflection-area]', function () {
            let val = $(this).find('textarea').val();
            let id = $(this).data('reflection-area');
            let navElem = $target.find(`[data-ref-nav="${id}"] div.hidden-elem`);

            if (val.length && val.length > $that.minReflectionChars) {
                navElem.show()
            } else {
                navElem.hide()
            }
        });

        $target.on('click', '[data-force-prev]', function () {
            let { paragraphId } = $(this).data();

            $target.find(`[data-reaction-card="${paragraphId}"]`).hide();
            $target.find(`[data-reflection-area="${paragraphId}"]`).hide();
        });
    }

    create(data = {}) {
        
        const components = this.components(),
            $target = this.$builder,
            paragraphContainerId = 'asset-paragraph-container-',
            $that = this;

        const { title, questionParagraphs, id } = data;
        let paragraphHTML = [];

        if (questionParagraphs && questionParagraphs.length) {
            $.each(questionParagraphs, function(index, paragraph) {
                let html = components.paragraphBlock(paragraph)

                paragraphHTML.push(html);
            });
        }
        else {
            paragraphHTML = [components.paragraphBlock({})]
        }

        $target.append(
            components.inputTitle(title, id),
            paragraphHTML
        )
    }

    answer(data = {}) {
        const components = this.components(),
            $target = this.$builder,
            paragraphContainerId = 'asset-paragraph-container-',
            $that = this;

        const { title, questionParagraphs } = data;
        let activeElemIndex = 1;

        // $target.append(components.title(title));

        $target.append(
            components.create('carousel slide', $that.carouselContainerId).attr('data-interval', false).css({ position: 'initial' }).append(
                components.create('carousel-inner d-flex').css({ position: 'initial' }).attr('id', 'paragraph-inner')
            )
        );

        $.each(questionParagraphs, function (index, paragraph = {}) {
            const { id, insight, image, questions, isActive } = paragraph;

            if (isActive) {
                activeElemIndex = index + 1;
            }

            let questionElements = [];

            $.each(questions, function (index, item) {
                if (item.isActive) {
                    $that.currentQuestionId = item.id;
                    $that.currentParagraphId = id;
                }

                questionElements.push(components.question({ ...item, index, paragraphId: id }));
            });

            $target.find('#paragraph-inner').append(
                components.create('container carousel-item mx-auto', paragraphContainerId + (index + 1), isActive ? 'active' : '')
                    .attr('sdlms-step', '').css({ position: 'initial', fontSize: 'larger' }).append(
                        components.image(image, id),
                        components.navigationIcon(paragraph, 'prev'), questionElements, components.navigationIcon(paragraph, 'next'),
                        components.reactionSection(paragraph), components.insightSpotter(paragraph)
                    )
            )

        });

        if (typeof Stepper !== 'undefined') {
            this.stepper = new Stepper({
                active: activeElemIndex,
                target: $('#' + this.carouselContainerId).find('#paragraph-inner')
            });
        }

        this.attachGlobalEvents();
    }

    reader(data = {}) { }

    getJSON() {
        return this.with;
    }
}
import {Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit} from '@angular/core';

import {PositionService, ElemPosition} from './position'
export enum AffixStatus {AFFIX, AFFIX_TOP, AFFIX_BOTTOM}

export class AffixStatusChange {
    constructor(public oldStatus:AffixStatus, public newStatus:AffixStatus) {}
}


@Directive({
    selector: 'affix'
})

export class AffixDirective implements OnInit, OnDestroy, AfterViewInit {

    @Input('affix-offset-top') affixOffsetTop: number = 0;
    @Input('affix-offset-bottom') affixOffsetBottom: number = 0;
    @Input('affix-start') start: number = 0;
    @Input('affix-class-top') affixClassTop: string = 'affix-top';
    @Input('affix-class') affixClass: string = 'affix';
    @Input('affix-class-bottom') affixClassBottom: string = 'affix-bottom';
    @Input('affix-parent') parentMode: boolean = true;

    @Output() public affixChange:EventEmitter<AffixStatusChange> = new EventEmitter(false);

    private onScrollBind: EventListener = this.onScroll.bind(this);
    private onResizeBind: EventListener = this.onResize.bind(this);

    private elem: any;
    private container: any;

    private status:AffixStatus = null;
    private window:Window;
    private pinnedOffset:number = null;

    // private containerHeight: number;
    // private elemHeight: number;
    // private containerStart: number;
    // private scrollFinish: number;

    constructor(private element: ElementRef, private positionService: PositionService) {
        this.elem = element.nativeElement;
    }

    ngOnInit(): void {
        window.addEventListener('scroll', this.onScrollBind);
        window.addEventListener('resize', this.onResizeBind);
    }

    ngOnDestroy(): void {
        window.removeEventListener('scroll', this.onScrollBind);
        window.removeEventListener('resize', this.onResizeBind);
    }

    ngAfterViewInit(): void {

        console.log("=============== VIEW INIT")
        // define scroll container as parent element
        this.container = this.elem.parentNode;

        this.checkPosition();
    }

    onScroll(): void {
        console.log("================ SCOLLED PAGE")
        this.checkPosition();
    }

    onResize(): void {
        this.checkPosition();
    }

    private checkPosition():void {
        let elemPos = this.positionService.position(this.element.nativeElement);
        if (elemPos.height === 0 || elemPos.width === 0) {
            // Element is not visible
            return;
        }
        let scrollHeight:number = Math.max(this.window.innerHeight, this.container.scrollHeight);
        let nativeElemPos:ElemPosition = this.positionService.offset(this.element.nativeElement);

        let newAffixStatus:AffixStatus = this.getState(scrollHeight, nativeElemPos, this.affixOffsetTop, this.affixOffsetBottom);

        if (this.status !== newAffixStatus) {

            // this.top = newAffixStatus === AffixStatus.AFFIX_BOTTOM ? this.getPinnedOffset() : null;

            this.affixChange.emit(new AffixStatusChange(this.status, newAffixStatus));
            this.status = newAffixStatus;


            //make sure we remove all affix classes
            this.elem.classList.remove(this.affixClass);
            this.elem.classList.remove(this.affixClassTop);
            this.elem.classList.remove(this.affixClassBottom);

            switch (this.status) {
                case AffixStatus.AFFIX_TOP:
                    this.elem.classList.add(this.affixClassTop);
                    break;
                case AffixStatus.AFFIX_BOTTOM:
                    this.elem.classList.add(this.affixClassBottom);
                    break;
                default:
                    this.elem.classList.add(this.affixClass);
                    break;
            }
        }

        // if (newAffixStatus === AffixStatus.AFFIX_BOTTOM) {
        //     this.top = scrollHeight - nativeElemPos.height - this.affixOffsetBottom;
        // }
    }

    private getState(scrollHeight:number, nativeElemPos:ElemPosition, offsetTop:number, offsetBottom:number):AffixStatus {
        let scrollTop:number = this.container.scrollTop; // current scroll position in pixels from top
        let targetHeight:number = this.window.innerHeight; // Height of the window / viewport area

        if (offsetTop !== null && this.status === AffixStatus.AFFIX_TOP) {
            if (scrollTop < offsetTop) {
                return AffixStatus.AFFIX_TOP;
            }
            return AffixStatus.AFFIX;
        }

        if (this.status === AffixStatus.AFFIX_BOTTOM) {
            if (offsetTop !== null) {
                if (scrollTop + this.pinnedOffset <= nativeElemPos.top) {
                    return AffixStatus.AFFIX;
                }
                return AffixStatus.AFFIX_BOTTOM;
            }
            if (scrollTop + targetHeight <= scrollHeight - offsetBottom) {
                return AffixStatus.AFFIX;
            }
            return AffixStatus.AFFIX_BOTTOM;
        }

        if (offsetTop != null && scrollTop <= offsetTop) {
            return AffixStatus.AFFIX_TOP;
        }

        let initializing:boolean = this.status === null;
        let lowerEdgePosition:number  = initializing ? scrollTop + targetHeight : nativeElemPos.top + nativeElemPos.height;
        if (offsetBottom != null && (lowerEdgePosition >= scrollHeight - offsetBottom)) {
            return AffixStatus.AFFIX_BOTTOM;
        }

        return AffixStatus.AFFIX;
    }

}
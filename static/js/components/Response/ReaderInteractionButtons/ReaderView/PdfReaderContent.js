import React, { useState, useRef } from "react";
import { Document, Page, Outline } from "react-pdf";
import {
    Button,
    Modal,
    Sidebar,
    Segment,
    Container,
    Dimmer,
    Loader,
} from "semantic-ui-react";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function AllPages(props) {
    const { pdf } = props;
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [outlineAvailable, setOutlineAvailable] = useState(false);
    const documentWrapperRef = useRef(null);

    function onItemClick({ pageNumber: itemPageNumber }) {
        setPageNumber(itemPageNumber);
        setSidebarVisible(false);
    }

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function onOutlineLoadSuccess(ol) {
        if (ol === null) {
            setOutlineAvailable(false);
        } else {
            setOutlineAvailable(true);
        }
    }

    function toggleSidebar() {
        if (sidebarVisible) {
            setSidebarVisible(false);
        } else {
            setSidebarVisible(true);
        }
    }

    function changePage(offset) {
        setPageNumber((prevPageNumber) => prevPageNumber + offset);
    }

    function previousPage() {
        changePage(-1);
    }

    function nextPage() {
        changePage(1);
    }

    function firstPage() {
        setPageNumber(1);
    }
    function lastPage() {
        setPageNumber(numPages);
    }

    function ContentOnlyPDF() {
        return (
            <div id="contentView">
                <Modal.Content
                    scrolling
                    //style={{ maxHeight: "calc(100vh - 133px)" }}
                    className="lw-reader-modal-pdf-doc"
                >
                    <Sidebar.Pushable as={Modal.Description}>
                        <Sidebar
                            animation="overlay"
                            icon="labeled"
                            visible={sidebarVisible}
                            style={{ background: "#fff" }}
                            color="blue"
                            width="very wide"
                            size="tiny"
                        >
                            <Outline
                                loading={
                                    <Segment>
                                        <Container
                                            text
                                            //style={{height: "calc(100vh - 60px",}}
                                        >
                                            <Dimmer active inverted>
                                                <Loader />
                                            </Dimmer>
                                        </Container>
                                    </Segment>
                                }
                                onItemClick={onItemClick}
                                onLoadSuccess={(ol) => onOutlineLoadSuccess(ol)}
                                onParseSuccess={(ol) => {
                                    console.log("onParseSuccess", ol);
                                }}
                            />
                        </Sidebar>
                        <Sidebar.Pusher>
                            <Page
                                loading={
                                    <Segment>
                                        <Container
                                            text
                                            style={{ marginTop: "200px" }}
                                        >
                                            <Dimmer active inverted>
                                                <Loader />
                                            </Dimmer>
                                        </Container>
                                    </Segment>
                                }
                                width={
                                    documentWrapperRef.current?.getBoundingClientRect()
                                        .width || undefined
                                }
                                pageNumber={pageNumber}
                            />
                        </Sidebar.Pusher>
                    </Sidebar.Pushable>
                </Modal.Content>
            </div>
        );
    }

    return (
        <div ref={documentWrapperRef} className="lw-reader-modal-content">
            <Document
                file={pdf}
                options={{ workerSrc: "/pdf.worker.js" }}
                onLoadSuccess={onDocumentLoadSuccess}
                externalLinkTarget="_blank"
                onItemClick={onItemClick}
                loading={
                    <Modal.Description>
                        <Segment>
                            <Container
                                text
                                style={{ marginTop: "200px" }}
                            >
                                <Dimmer active inverted>
                                    <Loader>Loading PDF</Loader>
                                </Dimmer>
                            </Container>
                        </Segment>
                    </Modal.Description>
                }
                error={
                    <Modal.Description>
                        <Segment>
                            <Container
                                text
                                style={{ marginTop: "200px" }}
                            >
                                <h3>Unable to preview</h3>
                                <p>
                                    Sorry, there was a problem loading a preview
                                    of this PDF.
                                </p>
                            </Container>
                        </Segment>
                    </Modal.Description>
                }
                className="lw-reader-modal-pdf"
            >
                <Modal.Actions>
                    <Button.Group fluid size="small">
                        <Button
                            content="Contents"
                            basic
                            disabled={outlineAvailable ? false : true}
                            onClick={toggleSidebar}
                            compact
                            active={sidebarVisible}
                        />
                        <Button
                            icon="step backward"
                            disabled={pageNumber <= 1}
                            onClick={firstPage}
                            compact
                        />
                        <Button
                            icon="left chevron"
                            disabled={pageNumber <= 1}
                            onClick={previousPage}
                            compact
                        />

                        <Button disabled basic>
                            {pageNumber || (numPages ? 1 : "--")} of{" "}
                            {numPages || "--"}
                        </Button>
                        <Button
                            icon="right chevron"
                            disabled={pageNumber >= numPages}
                            onClick={nextPage}
                            compact
                        />
                        <Button
                            icon="step forward"
                            disabled={pageNumber >= numPages}
                            onClick={lastPage}
                            compact
                        />
                    </Button.Group>
                </Modal.Actions>
                <ContentOnlyPDF />
            </Document>
        </div>
    );
}

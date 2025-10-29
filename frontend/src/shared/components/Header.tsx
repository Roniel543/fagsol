'use client';

import { Button } from ".";

const Header = () => {
    return (
        <header className="shadow-sm relative z-50">
            <nav className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                    <div className="flex items-center">
                        <a href="/" className="text-2xl font-bold text-white w-52">
                            <img
                                width="100%"
                                className=""
                                src="/assets/logo_text.svg"
                                alt="Fagsol S.A.C"
                            />
                        </a>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="/"
                            className="text-gray-300 hover:text-yellow-600 font-semibold transition-colors"
                        >Inicio
                        </a>
                        <a
                            href="/cursos"
                            className="text-gray-300 hover:text-yellow-600 font-semibold transition-colors"
                        >Cursos
                        </a>
                        <a
                            href="/procesos"
                            className="text-gray-300 hover:text-yellow-600 font-semibold transition-colors"
                        >Procesos
                        </a>
                        <a
                            href="/marketplace"
                            className="text-gray-300 hover:text-yellow-600 font-semibold transition-colors"
                        >Marketplace
                        </a>
                        <a
                            className="text-gray-300 hover:text-yellow-600 font-semibold transition-colors"
                            href="">Proyectos
                        </a>
                        <a
                            href="/contacto"
                            className="text-gray-300 hover:text-blue-600 transition-colors"
                        >Contacto
                        </a>
                    </div>


                    <Button variant="primary">Botón Primario</Button>

                    <div className="md:hidden">

                    </div>
                </div>
            </nav>
        </header>
    )
}
export default Header;